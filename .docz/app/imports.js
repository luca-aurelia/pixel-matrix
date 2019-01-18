export const imports = {
  'docs-source/api-reference.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "docs-source-api-reference" */ 'docs-source/api-reference.mdx'),
  'docs-source/examples.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "docs-source-examples" */ 'docs-source/examples.mdx'),
}
