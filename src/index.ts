import {
  ExtensionContext,
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  services,
  workspace,
  window,
  Uri,
} from 'coc.nvim';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

const logFile = path.join(os.tmpdir(), 'coc-roslyn-vbnet.log');

function log(msg: string): void {
  fs.appendFileSync(logFile, `${new Date().toISOString()} ${msg}\n`);
}

/**
 * Custom URI converter that avoids %3A encoding for drive letter colon on Windows.
 * .NET's Uri class can't resolve file:///c%3A/path to a valid local path on Windows.
 * NeoVim sends file:///c:/path (no encoding), which .NET resolves correctly.
 */
function roslynUriConverter(uri: Uri): string {
  const s = uri.toString();
  const fixed = s.replace(/^file:\/\/\/([a-zA-Z])%3A/i, 'file:///$1:');
  if (s !== fixed) {
    log(`URI FIX: ${s} -> ${fixed}`);
  }
  return fixed;
}

export async function activate(context: ExtensionContext): Promise<void> {
  log('=== Extension activating ===');
  log(`cwd: ${workspace.cwd}`);

  const serverOptions: ServerOptions = {
    command: 'vb-ls',
    args: ['--logLevel', 'Information', '--stdio', '--autoLoadProjects'],
  };

  const cwdUri = `file:///${workspace.cwd.replace(/\\/g, '/')}`;
  log(`workspaceFolder URI: ${cwdUri}`);

  const clientOptions: any = {
    documentSelector: [
      { scheme: 'file', language: 'vb' },
      { scheme: 'file', language: 'vbnet' },
    ],
    workspaceFolder: {
      uri: cwdUri,
      name: path.basename(workspace.cwd),
    },
    initializationOptions: {},
    uriConverter: { code2Protocol: roslynUriConverter },
    outputChannelName: 'roslyn-vbnet',
    middleware: {
      provideCompletionItem: async (document: any, position: any, context: any, token: any, next: any) => {
        const result = await next(document, position, context, token);
        const count = result === null || result === undefined ? 'NULL' :
          Array.isArray(result) ? result.length :
          (result as any).items?.length ?? '?';
        log(`completion: pos=${JSON.stringify(position)} trigger=${context?.triggerKind} -> ${count} items`);
        return result;
      },
    },
  };

  const client = new LanguageClient(
    'roslyn-vbnet',
    'Roslyn VB.NET Language Server',
    serverOptions,
    clientOptions
  );

  client.onReady().then(() => {
    log('Server ready');
  }).catch(e => log(`onReady error: ${e}`));

  context.subscriptions.push(services.registLanguageClient(client));
  log('Client registered');
}
