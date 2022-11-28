# <%- name %>

<%- name %> is a [NodeCG](http://github.com/nodecg/nodecg) bundle.
It works with NodeCG versions which satisfy this [semver](https://docs.npmjs.com/getting-started/semantic-versioning) range: `<%- compatibleRange %>`
You will need to have an appropriate version of NodeCG installed to use it.

<% if (typescript) { %>

## Developing

Run `npm run build` to build the project once. Run `npm run watch` to build the project and automatically rebuild on changes.
<% } %>
