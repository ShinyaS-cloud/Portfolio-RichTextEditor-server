export const sleep = (waitSeconds: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, waitSeconds * 1000)
  })
}
