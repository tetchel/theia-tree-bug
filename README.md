# Theia TreeView

This is a smallish sample for reproducing Theia bugs:
- https://github.com/theia-ide/theia/issues/4975
- https://github.com/theia-ide/theia/issues/4978

Forked from: https://github.com/eclipse/che-theia-samples/tree/master/samples/tree-view-sample-plugin replacing the simple tree items (strings) with more complex objects.

Build the extension with `yarn run build` and copy it into your `theia/plugins/` directory, then restart Theia to pick up the change. See the [original README](https://github.com/eclipse/che-theia-samples/tree/master/samples/tree-view-sample-plugin).

To reproduce [4978](https://github.com/theia-ide/theia/issues/4978), right-click a comment in the tree and run the Do Something command.
See [around line 100 of `comments.ts`](https://github.com/tetchel/theia-tree-bug/blob/master/src/comments.ts#L101) for the command code.

The output in the Theia console will be like the following:
```
root INFO [hosted-plugin: 42044] right-click args { text: 'Can you share the link to this example?', id: 1 }

root INFO [hosted-plugin: 42044] is it a comment? false

root ERROR [hosted-plugin: 42044] Doing something failed TypeError: arg.doSomething is not a function
    at /private/var/folders/7m/17bccvdd1zq3b2lvwqv2cknr0000gn/T/theia-unpacked/tree_view_sample_plugin.theia/lib/comments.js:110:90
    at /Users/tim/programs/clones/theia/packages/plugin-ext/lib/plugin/command-registry.js:113:28
    at CommandRegistryImpl.executeLocalCommand (/Users/tim/programs/clones/theia/packages/plugin-ext/lib/plugin/command-registry.js:165:44)
    at CommandRegistryImpl.$executeCommand (/Users/tim/programs/clones/theia/packages/plugin-ext/lib/plugin/command-registry.js:130:45)
    at RPCProtocolImpl.doInvokeHandler (/Users/tim/programs/clones/theia/packages/plugin-ext/lib/api/rpc-protocol.js:206:23)
    at RPCProtocolImpl.invokeHandler (/Users/tim/programs/clones/theia/packages/plugin-ext/lib/api/rpc-protocol.js:191:41)
    at RPCProtocolImpl.receiveRequest (/Users/tim/programs/clones/theia/packages/plugin-ext/lib/api/rpc-protocol.js:153:45)
    at RPCProtocolImpl.receiveOneMessage (/Users/tim/programs/clones/theia/packages/plugin-ext/lib/api/rpc-protocol.js:123:22)
    at /Users/tim/programs/clones/theia/packages/plugin-ext/lib/api/rpc-protocol.js:55:89
    at /Users/tim/programs/clones/theia/packages/plugin-ext/lib/api/rpc-protocol.js:232:17
```

In VS Code, the object, and ALL its properties including non-enumerable ones such as functions, are passed to the command handler.

In Theia, the non-enumerable properties are lost, which means the instanceof check returns false, and we cannot call Comment functions on the tree object.
This is likely just a symptom of 4975.

To reproduce [4975](https://github.com/theia-ide/theia/issues/4975), uncomment the [`self` and `_self` lines](https://github.com/tetchel/theia-tree-bug/blob/master/src/comments.ts#L8) in the `Comment` class.
The comments will no longer show up in the TreeView at all.
