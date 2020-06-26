declare module 'import-all.macro' {
  declare const loader: {
    sync: <T>(path: string) => T
  }

  export default loader
}
