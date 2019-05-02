/**
 * Generated using theia-plugin-generator
 *
 * If it's necessary, update your theia.d.ts with this one
 * https://raw.githubusercontent.com/theia-ide/theia/tree-view/packages/plugin/src/theia.d.ts
 */

import * as vscode from 'vscode';
import { Comments } from './comments';

export function activate(context: vscode.ExtensionContext) {
    new Comments(context);
}

export function deactivate() {
}
