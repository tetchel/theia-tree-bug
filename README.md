# Theia TreeView

This is a smallish sample for reproducing Theia bugs:
- https://github.com/theia-ide/theia/issues/4975
- https://github.com/theia-ide/theia/issues/4978

See the `vscode` branch for a version that works in VS Code.

Forked from: https://github.com/eclipse/che-theia-samples/tree/master/samples/tree-view-sample-plugin replacing the simple tree items (strings) with more complex objects.

Build the extension with `yarn run build` (or just [download it](https://raw.githubusercontent.com/tetchel/theia-tree-bug/master/tree_view_sample_plugin.theia)) and copy it into your `theia/plugins/` directory, then restart Theia to pick up the change. See the [original README](https://github.com/eclipse/che-theia-samples/tree/master/samples/tree-view-sample-plugin).

To reproduce [4978](https://github.com/theia-ide/theia/issues/4978), right-click a comment in the tree and run the `Do Something` command.
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

A fix to 4975 to fix the `JSON.stringify` behaviour would likely fix this bug too.

***

To reproduce [4975](https://github.com/theia-ide/theia/issues/4975), uncomment the [`self` and `_self` lines](https://github.com/tetchel/theia-tree-bug/blob/master/src/comments.ts#L8) in the `Comment` class.
The comments will no longer show up in the TreeView at all. You will see errors in the console like:
```
root ERROR [hosted-plugin: 58518] (node:58518) UnhandledPromiseRejectionWarning: TypeError: Converting circular structure to JSON
    at JSON.stringify (<anonymous>)
    at Function.MessageFactory.replyOK (/Users/tim/programs/clones/theia/packages/plugin-ext/lib/api/rpc-protocol.js:287:107)
    at /Users/tim/programs/clones/theia/packages/plugin-ext/lib/api/rpc-protocol.js:157:51
    at processTicksAndRejections (internal/process/task_queues.js:86:5)
(node:58518) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). (rejection id: 4)
```

An example of the object the rpc-protocol is trying to stringify:
```
root ERROR [hosted-plugin: 58518] Couldn't stringify object:
[{
    id: 'item-7/ext.tv.comment',
    label: 'Great plugin!',
    icon: 'fa-sticky-note medium-red',
    tooltip: undefined,
    collapsibleState: undefined,
    metadata: Comment {
        text: 'Great plugin!',
        id: 0,
        _self: [Circular]
    }
},
{
    id: 'item-8/ext.tv.comment',
    label: 'Can you share the link to this example?',
    icon: 'fa-sticky-note medium-red',
    tooltip: undefined,
    collapsibleState: undefined,
    metadata: Comment {
        text: 'Can you share the link to this example?',
        id: 1,
        _self: [Circular]
    }
}]
```
