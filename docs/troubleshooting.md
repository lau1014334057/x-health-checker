# Troubleshooting

## 中文

### Chrome 扩展报错：`Uncaught SyntaxError: Unexpected token 'export'`

如果在 `chrome://extensions` 的扩展错误页看到类似报错：

```text
Uncaught SyntaxError: Unexpected token 'export'
```

并且堆栈指向：

```text
src/content/index.js
```

通常说明 content script 被 Chrome 当作普通脚本执行，但编译后的文件里仍然包含 ES Module 语法，例如：

```js
export {};
```

本项目中，`extension/src/content/index.ts` 顶部如果使用了 `import type`，TypeScript 会把该文件视为模块。即使类型导入不会进入运行时代码，编译结果也可能在文件末尾生成 `export {};`。而 `extension/manifest.json` 里的 `content_scripts` 默认不能直接加载模块脚本，因此 Chrome 会在注入脚本时抛出这个语法错误。

推荐处理方式：

- 避免在 content script 入口文件中使用 `import` 或 `import type`。
- 将 content script 需要的类型改为本文件内的轻量类型声明。
- 或者调整构建流程，确保 `extension/dist/src/content/index.js` 输出为不含 `import` / `export` 的普通脚本。

修复后重新构建并加载扩展：

```bash
npm run build:extension
```

然后在 `chrome://extensions` 中重新加载 `extension/dist`。

## English

### Chrome extension error: `Uncaught SyntaxError: Unexpected token 'export'`

If Chrome reports this error on the extension error page:

```text
Uncaught SyntaxError: Unexpected token 'export'
```

and the stack points to:

```text
src/content/index.js
```

the content script is being executed as a classic script while the compiled output still contains ES Module syntax, for example:

```js
export {};
```

In this project, a type-only import in `extension/src/content/index.ts` can make TypeScript treat the file as a module. Even though the type import is erased at runtime, TypeScript may still emit `export {};` at the end of the compiled file. The `content_scripts` entry in `extension/manifest.json` does not load that file as a module, so Chrome fails while injecting the script.

Recommended fixes:

- Avoid `import` and `import type` in the content script entry file.
- Replace content-script-only imports with small local type declarations when possible.
- Or update the build pipeline so `extension/dist/src/content/index.js` is emitted as a classic script with no `import` / `export` syntax.

After fixing it, rebuild and reload the extension:

```bash
npm run build:extension
```

Then reload `extension/dist` from `chrome://extensions`.
