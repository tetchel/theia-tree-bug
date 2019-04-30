# Theia TreeView

This is a smallish sample for reproducing Theia bugs:
- https://github.com/theia-ide/theia/issues/4975
- https://github.com/theia-ide/theia/issues/4978

Forked from: https://github.com/eclipse/che-theia-samples/tree/master/samples/tree-view-sample-plugin replacing the simple tree items (strings) with more complex objects.

Build the extension with `yarn run build` and copy it into your `theia/plugins/` directory, then restart Theia to pick up the change. See the [original README](https://github.com/eclipse/che-theia-samples/tree/master/samples/tree-view-sample-plugin).

To reproduce [4978](https://github.com/theia-ide/theia/issues/4978), right-click a comment in the tree and run the Do Something command.
See [around line 100 of `comments.ts`](https://github.com/tetchel/theia-tree-bug/blob/master/src/comments.ts#L101) for the command code.

In VS Code, the object, and ALL its properties including non-enumerable ones such as functions, are passed to the command handler.

In Theia, the non-enumerable properties are lost, which means the instanceof check returns false, and we cannot call Comment functions on the tree object.
This is likely just a symptom of 4975.

To reproduce [4975](https://github.com/theia-ide/theia/issues/4975), uncomment the [`self` and `_self` lines](https://github.com/tetchel/theia-tree-bug/blob/master/src/comments.ts#L8) in the `Comment` class.
The comments will no longer show up in the TreeView at all.
