import * as vscode from 'vscode';
import * as path from "path";
class Comment {

    private static nextId = 0;

    public readonly id: number;
    // circular reference to totally break the tree view
    // https://github.com/theia-ide/theia/issues/4975
    // private readonly _self: Comment;

    constructor(
        public readonly text: string
    ) {
        this.id = Comment.nextId++;
        // this._self = this;
    }

    public doSomething(): string {
        return `Doing something with comment ${this.id}: ${this.text}`;
    }

    // public get self(): Comment {
    // return this._self;
    // }
}

const comments: Map<string, Comment[]> = new Map<string, Comment[]>();
comments.set('Ann', [
    new Comment('Great plugin!'),
    new Comment('Can you share the link to this example?')
]);
comments.set('Yevhen', [
    new Comment('Cleanup your code please')
]);
comments.set('Sun', [
    new Comment('Do not forget about docs')
]);

// const gitHubProfiles: Map<string, string> = new Map<string, string>();
// gitHubProfiles.set('Ann', 'https://github.com/ashumilova');
// gitHubProfiles.set('Yevhen', 'https://github.com/evidolob');
// gitHubProfiles.set('Sun', 'https://github.com/sunix');

const ON_DID_SELECT_USER = 'treeViewSample.onDidSelectUser';
const ON_DID_SELECT_COMMENT = 'treeViewSample.onDidSelectComment';

const CONTEXT_CMD_ID = "test.context.cmd";
const COMMENT_CONTEXT_VALUE = "ext.tv.comment";

export class Comments {

    treeDataProvider: TestDataProvider;
    tree: vscode.TreeView<MyTreeItem>;

    selectedUser: string | undefined;

    constructor(context: vscode.ExtensionContext) {
        this.treeDataProvider = new TestDataProvider(context.extensionPath);
        // const tdp = vscode.window.registerTreeDataProvider('comments', this.treeDataProvider);
        this.tree = vscode.window.createTreeView('comments', { treeDataProvider: this.treeDataProvider });
        context.subscriptions.push(this.tree);

        this.tree.onDidExpandElement(event => {
            // handle expanding
        });

        this.tree.onDidCollapseElement(event => {
            // handle collapsing
        });

        context.subscriptions.push(
            vscode.commands.registerCommand('treeViewSample.addUser', args => this.addUser(args)));

        // context.subscriptions.push(
        //     theia.commands.registerCommand({
        //         id: 'treeViewSample.addProfile',
        //         label: '[TreeView] Add Profile'
        //     }, args => this.addUserProfile(args)));

        context.subscriptions.push(
            vscode.commands.registerCommand('treeViewSample.addComment', args => this.addComment(args)));

        context.subscriptions.push(
            vscode.commands.registerCommand(ON_DID_SELECT_USER, args => this.onDidSelectUser(args)));

        context.subscriptions.push(
            vscode.commands.registerCommand(ON_DID_SELECT_COMMENT, args => this.onDidSelectComment(args)));


        // DEMO OF https://github.com/theia-ide/theia/issues/4978
        context.subscriptions.push(
            vscode.commands.registerCommand(CONTEXT_CMD_ID, (arg: Comment) => {
                // In VS Code, the same Comment instance that was added to the tree will be passed.
                // In Theia, we lose the non-stringifiable fields, such as functions
                console.log("right-click args", arg);
                // This will print false in Theia
                console.log("is it a comment?", (arg instanceof Comment));
                try {
                    // This will fail in Theia 'arg.doSomething() is not a function'
                    vscode.window.showInformationMessage(arg.doSomething());
                }
                catch (err) {
                    const errMsg = "Doing something failed";
                    console.error(errMsg, err);
                    vscode.window.showErrorMessage(errMsg);
                }
            }));
    }

    onDidSelectUser(...args: any[]) {
        console.log("A user was selected, here are the args:", args);
        if (args && args.length > 0) {
            this.selectedUser = args[0].toString();
        } else {
            this.selectedUser = undefined;
        }
    }

    onDidSelectComment(...args: any[]) {
        console.log("A comment was selected, here are the args:", args);
        this.selectedUser = undefined;

        if (args && args.length > 0) {
            let selectedComment = args[0].toString();
            comments.forEach((comments, user) => {
                comments.forEach(comment => {
                    if (selectedComment === comment) {
                        this.selectedUser = user;
                    }
                });
            });
        }
    }

    addUser(...args: any[]) {
        vscode.window.showInputBox({
            prompt: 'Type user name to be added to the list',
            placeHolder: 'User name'
        }).then(value => {
            if (value) {
                comments.set(value, []);
                this.treeDataProvider.sendDataChanged(undefined);

                setTimeout(() => {
                    // this.tree.reveal(value);
                }, 100);
            }
        });
    }

    addComment(...args: any[]) {
        if (this.selectedUser) {
            vscode.window.showInputBox({
                prompt: 'Enter new comment',
                placeHolder: 'Comment'
            }).then(value => {
                if (value) {
                    const commentsArray = comments.get(this.selectedUser!);
                    if (commentsArray) {
                        commentsArray.push(new Comment(value));
                        this.treeDataProvider.sendDataChanged(this.selectedUser);

                        setTimeout(() => {
                            // this.tree.reveal(value);
                        }, 100);
                    }
                }
            });
        }
    }

    // addUserProfile(...args: any[]) {
    //     if (this.selectedUser) {
    //         theia.window.showInputBox({
    //             prompt: 'Enter user profile',
    //             placeHolder: 'User Profile'
    //         }).then(value => {
    //             if (value) {
    //                 gitHubProfiles.set(this.selectedUser!, value);
    //                 this.treeDataProvider.sendDataChanged(this.selectedUser);
    //             }
    //         });
    //     }
    // }

}

type MyTreeItem = Comment | string;

export class TestDataProvider implements vscode.TreeDataProvider<MyTreeItem> {

    private onDidChangeTreeDataEmitter: vscode.EventEmitter<MyTreeItem> = new vscode.EventEmitter<MyTreeItem>();
    readonly onDidChangeTreeData: vscode.Event<MyTreeItem> = this.onDidChangeTreeDataEmitter.event;

    constructor(
        public readonly extensionPath: string,
    ) {

    }

    public sendDataChanged(item: MyTreeItem | undefined) {
        console.log("Refresh tree");
        this.onDidChangeTreeDataEmitter.fire(item);
    }

    /**
     * Get [TreeItem](#TreeItem) representation of the `element`
     *
     * @param element The element for which [TreeItem](#TreeItem) representation is asked for.
     * @return [TreeItem](#TreeItem) representation of the element
     */
    getTreeItem(element: MyTreeItem): vscode.TreeItem | PromiseLike<vscode.TreeItem> {
        if (element instanceof Comment) {
            return {
                label: element.text,
                iconPath: path.join(this.extensionPath, "resources", "comments.svg"),
                contextValue: COMMENT_CONTEXT_VALUE,
                command: {
                    command: ON_DID_SELECT_COMMENT,
                    title: "",
                    arguments: [element]
                }
            };
        }

        return {
            label: element,
            iconPath: 'fa-user medium-yellow',
            command: {
                command: ON_DID_SELECT_USER,
                title: "",
                arguments: [element]
            },

            collapsibleState: vscode.TreeItemCollapsibleState.Expanded
        };
    }

    async getChildren(element?: MyTreeItem): Promise<MyTreeItem[]> {
        if (element == null) {
            return this.getRootChildren();
        }
        if (!(element instanceof Comment)) {
            element = element as string;
            if (comments.has(element)) {
                return comments.get(element)!;
            }
        }
        return [];
    }

    async getRootChildren(): Promise<MyTreeItem[]> {
        return Array.from(comments.keys());
    }
}
