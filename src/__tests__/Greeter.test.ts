import { generate } from '../index'
import { join } from 'path'
test('My Greeter', async () => {
    await generate(join(__dirname, '../../'))
    // expect(config.pagesDir).toBe('Hello Carl')
})
