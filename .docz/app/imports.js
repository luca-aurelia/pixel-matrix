export const imports = {
  'documentation/api-reference.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "documentation-api-reference" */ 'documentation/api-reference.mdx'),
  'documentation/examples.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "documentation-examples" */ 'documentation/examples.mdx'),
}
