import {vi, beforeEach, afterAll} from 'vitest'

// mocks console methods to prevent tests creating lots of log messages
beforeEach(()=>{
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
})

afterAll(()=>{
    vi.clearAllMocks()
})
