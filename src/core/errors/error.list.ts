export const USERS_ERRORS = {
    NOT_EXIST_USER: {
        errorCode: 100001,
        message: '해당 유저를 찾을 수 없습니다.',
    },
    USER_NAME_ALREADY_EXIST: {
        errorCode: 100002,
        message: '이미 존재하는 Name입니다.',
    },
    FAILED_CREATE_USER: {
        errorCode: 100003,
        message: '유저 생성에 실패했습니다.',
    },
    FAILED_GET_USER_PROFILE: {
        errorCode: 100004,
        message: '유저 프로필 조회에 실패했습니다.',
    },
}

export const AUTH_ERRORS = {
    NOT_EXIST_TOKEN: {
        errorCode: 200001,
        message: '토큰 데이터가 없습니다.',
    },
    INVALID_TOKEN: {
        errorCode: 200002,
        message: '유효하지 않은 토큰입니다.',
    },
    EXPIRED_TOKEN: {
        errorCode: 200003,
        message: '만료된 토큰입니다.',
    },
    INVALID_SIGNATURE: {
        errorCode: 200004,
        message: '유효하지 않은 토큰 서명입니다.',
    },
    FAILED_AUTHENTICATE: {
        errorCode: 200005,
        message: '인증에 실패했습니다.',
    },
}
