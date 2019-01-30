import { generate } from '../index'
import { join } from 'path'
test('generate route config', async () => {
    await generate(join(__dirname, '../../'))
    // expect(config.pagesDir).toBe('Hello Carl')
})
