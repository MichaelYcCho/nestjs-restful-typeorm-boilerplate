// Jest e2e 테스트 글로벌 설정
jest.setTimeout(30000)

// 글로벌 테스트 설정
beforeAll(async () => {
    // 테스트 시작 전 로그
    console.log('Starting e2e tests...')
})

afterAll(async () => {
    // 테스트 종료 후 로그
    console.log('e2e tests completed.')
})
