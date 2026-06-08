export const USERNAME_VALIDATION_REGEX = /^(?!.*\.\.)(?!.*__)[a-zA-Z0-9._]{3,20}$/

export const MENTION_CAPTURE_REGEX = /(?<![\p{L}\p{N}._])@([a-zA-Z0-9._]{3,20})/gu
export const HASHTAG_CAPTURE_REGEX = /(?<![\p{L}\p{N}_])#([\p{L}\p{N}_]{1,100})/gu

export const ACTIVE_SOCIAL_TOKEN_REGEX = /(^|[\s([{])([@#])([^\s@#]{0,50})$/u
export const SOCIAL_SPLIT_REGEX = /(@[a-zA-Z0-9._]{3,20}|#[\p{L}\p{N}_]{1,100})/gu

export const USERNAME_EXACT_REGEX = /^[a-zA-Z0-9._]{3,20}$/
export const HASHTAG_EXACT_REGEX = /^[\p{L}\p{N}_]{1,100}$/u

export const VIDEO_PATH_REGEX = /^\/@[^/]+\/video\/[^/]+$/
