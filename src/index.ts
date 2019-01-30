import chokidar from 'chokidar'
import fs from 'fs'
import glob from 'glob'
import commander from 'commander'
import { join } from 'path'

interface IConfig {
    pagesDir: string
    routesConfigPath: string
    indexPage?: string
}
interface IRoute {
    path: string
    component: string
}

const DYNAMIC_ROUTE_REGEX = /^\/([:*])/

const sortRoutes = (routes: IRoute[]) => {
    routes.sort((a, b) => {
        if (!a.path.length) {
            return -1
        }
        if (!b.path.length) {
            return 1
        }
        // Order: /static, /index, /:dynamic
        // Match exact route before index: /login before /index/_slug
        if (a.path === '/') {
            return DYNAMIC_ROUTE_REGEX.test(b.path) ? -1 : 1
        }
        if (b.path === '/') {
            return DYNAMIC_ROUTE_REGEX.test(a.path) ? 1 : -1
        }

        let i
        let res = 0
        let y = 0
        let z = 0
        // tslint:disable-next-line: variable-name
        const _a = a.path.split('/')
        // tslint:disable-next-line: variable-name
        const _b = b.path.split('/')
        for (i = 0; i < _a.length; i++) {
            if (res !== 0) {
                break
            }
            y = _a[i] === '*' ? 2 : _a[i].includes(':') ? 1 : 0
            z = _b[i] === '*' ? 2 : _b[i].includes(':') ? 1 : 0
            res = y - z
            // If a.length >= b.length
            if (i === _b.length - 1 && res === 0) {
                // unless * found sort by level, then alphabetically
                res =
                    _a[i] === '*' ? -1 : _a.length === _b.length ? a.path.localeCompare(b.path) : _a.length - _b.length
            }
        }

        if (res === 0) {
            // unless * found sort by level, then alphabetically
            res =
                _a[i - 1] === '*' && _b[i]
                    ? 1
                    : _a.length === _b.length
                    ? a.path.localeCompare(b.path)
                    : _a.length - _b.length
        }
        return res
    })

    // routes.forEach((route) => {
    //   if (route.children) {
    //     sortRoutes(route.children)
    //   }
    // })

    return routes
}

const loadConfig = (file: string): IConfig => {
    const f = fs.readFileSync(file)
    return JSON.parse(f.toString())
}

export const generate = async (projectRoot: string, watchMode = false) => {
    const config: IConfig = loadConfig(join(projectRoot, 'rrcg.json'))
    const pagesDir = join(projectRoot, config.pagesDir.replace(/\/$/, ''))
    const routesPath = join(projectRoot, config.routesConfigPath)
    const indexPage = config.indexPage || '/'

    let routes: IRoute[] = []

    const isPage = (fPath: string) => {
        return /\/@[a-zA-Z0-9_\-]+.tsx$/.test(fPath)
    }

    const createRoute = (file: string) => {
        const keys = file
            .replace('@', '')
            .replace(/(-|_)/g, '/$1') // detail-name_age --> detail/-name/_age
            .replace(/\/{2,}/g, '/') // /one//two///three --> /one/two/three
            .split('/')
        const routePath = keys
            .map(key => {
                if (key.startsWith('_')) {
                    return `:${key.substr(1)}?`
                }
                if (key.startsWith('-')) {
                    return `:${key.substr(1)}`
                }
                return key
            })
            .join('/')
            .replace(/\/index$/, '')

        return {
            path: routePath === indexPage ? '/' : routePath,
            component: file.replace(/\/index$/, ''),
        }
    }

    // const writeRoutesFile = lodash.debounce(async () => {
    const writeRoutesFile = async () => {
        const routesJson = JSON.stringify(routes, undefined, 2)
        await new Promise(resolve => {
            fs.writeFile(routesPath, routesJson, async err => {
                if (err) {
                    throw err
                }
                resolve()
            })
        })
        console.log(`generate routes json:${routesPath}`)
    }
    // }, 1000)

    const addRoute = (f: string) => {
        f = f.replace(new RegExp(`^${pagesDir}`), '').replace(/\.tsx$/, '')
        const route = createRoute(f)
        routes.push(route)
        routes = sortRoutes(routes)
        console.log(`add route :${route.path} -> ${f}`)
    }
    const removeRoute = (f: string) => {
        f = f.replace(new RegExp(`^${pagesDir}`), '').replace(/\.tsx$/, '')
        const routePath = createRoute(f).path
        routes = routes.filter(r => r.path !== routePath)
        console.log(`remove route :${routePath} -> ${f}`)
    }

    await new Promise(resolve => {
        glob(`${pagesDir}/**/*.tsx`, async (err, files) => {
            for (const file of files) {
                if (isPage(file)) {
                    addRoute(file)
                }
            }
            await writeRoutesFile()
            resolve()
        })
    })

    if (watchMode) {
        console.log('wait for changes...')
        const watcher = chokidar.watch(pagesDir, { ignoreInitial: true })
        watcher.on('add', async (rPath: string) => {
            if (isPage(rPath)) {
                addRoute(rPath)
                await writeRoutesFile()
            }
        })
        watcher.on('unlink', async (rPath: string) => {
            if (isPage(rPath)) {
                removeRoute(rPath)
                await writeRoutesFile()
            }
        })

        // re generate if rrcg.json change
        chokidar.watch(join(projectRoot, 'rrcg.json'), { ignoreInitial: true }).once('all', () => {
            watcher.close()
            generate(projectRoot, watchMode)
        })
    }
}

export const generateCli = async () => {
    commander.option('-w, --watch', 'Watch mode').parse(process.argv)
    const projectRoot = process.cwd()

    generate(projectRoot, commander.watch)
}
