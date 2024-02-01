module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: ['**/*.(t|j)s'],
    coverageDirectory: '../coverage',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@auth/(.*)$': '<rootDir>/src/auth/$1',
        '^@config/(.*)$': '<rootDir>/src/config/$1',
        '^@core/(.*)$': '<rootDir>/src/core/$1',
        '^@users/(.*)$': '<rootDir>/src/users/$1',
    },
}
