# coc-roslyn-vbnet

VB.NET language support for Vim/coc.nvim via the Roslyn Language Server.

Provides IntelliSense, diagnostics, go-to-definition, and other IDE features for VB.NET projects.

## Features

- Member-access completions (`Console.`, `myObj.`, etc.)
- Keyword and type completions
- Real-time diagnostics (errors, warnings)
- Signature help
- Go to definition
- Find references
- Document symbols

## Requirements

- [coc.nvim](https://github.com/neoclide/coc.nvim) >= 0.0.82
- [vb-ls](https://www.nuget.org/packages/vb-ls) (Roslyn-based VB.NET language server)
- .NET 10 SDK

## Installation

### 1. Install vb-ls

```sh
dotnet tool install -g vb-ls
```

### 2. Install the extension

**From npm** (once published):

```vim
:CocInstall coc-roslyn-vbnet
```

**Local install** (from source):

```sh
git clone https://github.com/cellsummer/coc-roslyn-vbnet.git
cd coc-roslyn-vbnet
npm install --legacy-peer-deps
npm run build
```

Then link into coc's extensions directory:

```sh
# Windows (run as admin or with developer mode enabled)
mklink /J "%LOCALAPPDATA%\coc\extensions\node_modules\coc-roslyn-vbnet" "C:\path\to\coc-roslyn-vbnet"

# Linux/macOS
ln -s ~/path/to/coc-roslyn-vbnet ~/.config/coc/extensions/node_modules/coc-roslyn-vbnet
```

Add the extension to coc's `extensions/package.json` (located in `%LOCALAPPDATA%\coc\extensions\` on Windows or `~/.config/coc/extensions/` on Linux/macOS):

```json
{
  "dependencies": {
    "coc-roslyn-vbnet": ">=0.1.0"
  }
}
```

### 3. Filetype detection

Ensure Vim recognizes `.vb` files as `vbnet`:

```vim
autocmd BufRead,BufNewFile *.vb set filetype=vbnet
```

## Usage

Open Vim from your VB.NET project directory (the one containing `.sln`, `.slnx`, or `.vbproj`):

```sh
cd MyProject
vim Program.vb
```

The extension will automatically:
1. Start the Roslyn language server
2. Detect your solution/project file
3. Load the project for full IntelliSense

## How It Works

The Roslyn language server (used by VS Code's C# extension) has full VB.NET support, but requires workspace folder URIs in a specific format on Windows. coc.nvim encodes the drive letter colon (`C:` → `C%3A`) which .NET's URI parser can't resolve to a valid local path.

This extension provides a custom `uriConverter` that ensures Windows file URIs use the format the Roslyn server expects:

```
✗ file:///c%3A/Users/...   → .NET resolves to /c:/Users/... (invalid)
✓ file:///c:/Users/...     → .NET resolves to c:\Users\... (valid)
```

## Configuration

In `coc-settings.json`:

```json
{
  "roslyn-vbnet.enable": true
}
```

| Setting | Default | Description |
|---------|---------|-------------|
| `roslyn-vbnet.enable` | `true` | Enable/disable the extension |

## Troubleshooting

**No completions or diagnostics:**
- Ensure you opened Vim from the project directory (`:pwd` should show the directory with `.sln`/`.vbproj`)
- Check `:CocInfo` shows the server is running
- Wait 10-15 seconds after startup for the project to fully load

**Only keyword completions (no `Console.` members):**
- The project hasn't loaded. Verify `.sln`/`.slnx` or `.vbproj` exists in your working directory
- Check the log: `type %TEMP%\coc-roslyn-vbnet.log` (Windows)

**Server won't start:**
- Verify `vb-ls` is installed: `vb-ls --help`
- Verify .NET 10 SDK: `dotnet --list-sdks`

## Building from Source

```sh
npm install --legacy-peer-deps
npm run build
```

## License

MIT
