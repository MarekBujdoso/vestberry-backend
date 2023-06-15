export const createFailureResponseByType = (type: string, message: string) => ({
  code: '400',
  success: false,
  message,
  [type]: null,
})

export const createSuccessResponseByType = (type: string, message: string, data: any) => ({
  code: '200',
  success: true,
  message,
  [type]: data,
})
