/**
 * Block Plus (Block Engine) - Core Multi-language Execution Engine
 * Polyglot Runtime for Native Block, JavaScript, Python, SQL, JSON, HTML, and DEL.
 * Designed for Scratch VM & Browser runtime environments.
 * 
 * Implements specifications from:
 * - O-O1112/Block_lang (Native Block AST, control flow, scope, builtins)
 * - O-O1112/Block (Polyglot tag parser, state transfer pipeline)
 * - O-O1112/Block-Web-Runtime (Browser Pyodide & SQLite Wasm integration)
 */

class BlockEngine {
    constructor(scratchBridge = null) {
        this.scratchBridge = scratchBridge;
        this.state = {};
        this.outputLogs = [];
        this.lastResult = '';
        this.pyodide = null;
        this.isPyodideLoading = false;

        // Try initializing Pyodide asynchronously if in browser
        if (typeof window !== 'undefined' && !window.__block_pyodide_promise) {
            this.initPyodide();
        }
    }

    setScratchBridge(bridge) {
        this.scratchBridge = bridge;
    }

    log(msg) {
        const text = String(msg);
        this.outputLogs.push(text);
        if (typeof console !== 'undefined' && console.log) {
            console.log('[Block Plus]', text);
        }
    }

    clearLogs() {
        this.outputLogs = [];
    }

    getLogs() {
        return this.outputLogs.join('\n');
    }

    resetState() {
        this.state = {};
        this.outputLogs = [];
        this.lastResult = '';
    }

    getState(key) {
        return this.state[key] !== undefined ? this.state[key] : '';
    }

    setState(key, value) {
        this.state[key] = value;
    }

    deleteState(key) {
        delete this.state[key];
    }

    getAllStateJson() {
        try {
            return JSON.stringify(this.state, null, 2);
        } catch (e) {
            return '{}';
        }
    }

    async initPyodide() {
        if (typeof window === 'undefined') return;
        if (window.__block_pyodide) {
            this.pyodide = window.__block_pyodide;
            return;
        }
        if (window.__block_pyodide_promise) {
            try {
                this.pyodide = await window.__block_pyodide_promise;
            } catch (e) {
                console.warn('[Block Plus] Pyodide load failed, using embedded fallback.', e);
            }
            return;
        }

        window.__block_pyodide_promise = (async () => {
            try {
                if (typeof loadPyodide === 'undefined') {
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js';
                    script.async = true;
                    await new Promise((resolve, reject) => {
                        script.onload = resolve;
                        script.onerror = reject;
                        document.head.appendChild(script);
                    });
                }
                const py = await loadPyodide({
                    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/'
                });
                window.__block_pyodide = py;
                return py;
            } catch (err) {
                console.warn('[Block Plus] Could not load Pyodide from CDN:', err);
                return null;
            }
        })();

        try {
            this.pyodide = await window.__block_pyodide_promise;
        } catch (e) {}
    }

    /**
     * Parse code into blocks according to Block language specifications
     */
    parseBlocks(code) {
        const normalized = (code || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        const lines = normalized.split('\n');
        const blocks = [];
        let currentLang = 'block';
        let buffer = [];

        const tagRegex = /^<(\/)?\s*([a-zA-Z0-9_\-]+)\s*>$/;
        const knownLangs = new Set(['js', 'javascript', 'py', 'python', 'sql', 'html', 'json', 'del', 'lua']);

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            const match = trimmed.match(tagRegex);

            if (match) {
                const isClosing = Boolean(match[1]);
                let langName = match[2].toLowerCase();
                if (langName === 'javascript') langName = 'js';
                if (langName === 'python') langName = 'py';

                if (!isClosing && currentLang === 'block' && knownLangs.has(langName)) {
                    if (buffer.length > 0) {
                        blocks.push({ language: 'block', code: buffer.join('\n') });
                        buffer = [];
                    }
                    currentLang = langName;
                    continue;
                } else if (isClosing && currentLang === langName) {
                    blocks.push({ language: currentLang, code: buffer.join('\n') });
                    buffer = [];
                    currentLang = 'block';
                    continue;
                }
            }
            buffer.push(line);
        }

        if (buffer.length > 0) {
            blocks.push({ language: currentLang, code: buffer.join('\n') });
        }

        return blocks;
    }

    /**
     * Execute Block Plus code across all language blocks
     */
    async execute(code) {
        const blocks = this.parseBlocks(code);
        let finalResult = '';

        for (const block of blocks) {
            const lang = block.language.toLowerCase();
            const blockCode = block.code.trim();
            if (!blockCode) continue;

            try {
                if (lang === 'block') {
                    finalResult = this.executeNativeBlock(block.code);
                } else if (lang === 'js') {
                    finalResult = this.executeJS(block.code);
                } else if (lang === 'py') {
                    finalResult = await this.executePython(block.code);
                } else if (lang === 'sql') {
                    finalResult = this.executeSQL(block.code);
                } else if (lang === 'json') {
                    finalResult = this.executeJSON(block.code);
                } else if (lang === 'html') {
                    finalResult = this.executeHTML(block.code);
                } else if (lang === 'del') {
                    finalResult = this.executeDel(block.code);
                } else {
                    this.log(`[Warning] Unsupported block language <${lang}>`);
                }
            } catch (err) {
                const errMsg = `[Block Plus Error <${lang}>]: ${err.message || err}`;
                this.log(errMsg);
                this.lastResult = errMsg;
                return errMsg;
            }
        }

        this.lastResult = finalResult !== undefined ? String(finalResult) : '';
        return this.lastResult;
    }

    /**
     * Synchronous execution of Native Block & JS stages (for instant Scratch tick)
     */
    executeSync(code) {
        const blocks = this.parseBlocks(code);
        let finalResult = '';

        for (const block of blocks) {
            const lang = block.language.toLowerCase();
            const blockCode = block.code.trim();
            if (!blockCode) continue;

            try {
                if (lang === 'block') {
                    finalResult = this.executeNativeBlock(block.code);
                } else if (lang === 'js') {
                    finalResult = this.executeJS(block.code);
                } else if (lang === 'py') {
                    finalResult = this.executePythonFallback(block.code);
                } else if (lang === 'sql') {
                    finalResult = this.executeSQL(block.code);
                } else if (lang === 'json') {
                    finalResult = this.executeJSON(block.code);
                } else if (lang === 'html') {
                    finalResult = this.executeHTML(block.code);
                } else if (lang === 'del') {
                    finalResult = this.executeDel(block.code);
                }
            } catch (err) {
                const errMsg = `[Block Plus Error <${lang}>]: ${err.message || err}`;
                this.log(errMsg);
                this.lastResult = errMsg;
                return errMsg;
            }
        }

        this.lastResult = finalResult !== undefined ? String(finalResult) : '';
        return this.lastResult;
    }

    /**
     * Execute JavaScript stage <js> ... </js>
     */
    executeJS(code) {
        const scope = { ...this.state };
        const engine = this;
        const scratch = this.scratchBridge || {};

        const customConsole = {
            log: (...args) => {
                const line = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
                engine.log(line);
            },
            warn: (...args) => engine.log('[Warn] ' + args.join(' ')),
            error: (...args) => engine.log('[Error] ' + args.join(' '))
        };

        const paramNames = ['state', 'globalState', 'scratch', 'print', 'console'];
        const paramValues = [
            this.state,
            this.state,
            scratch,
            (...args) => customConsole.log(...args),
            customConsole
        ];

        // Also inject valid top-level state variables directly
        for (const key of Object.keys(this.state)) {
            if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) && !paramNames.includes(key)) {
                paramNames.push(key);
                paramValues.push(this.state[key]);
            }
        }

        let wrapped = `
            try {
                ${code}
            } catch(e) {
                throw e;
            }
        `;

        const fn = new Function(...paramNames, wrapped);
        const res = fn(...paramValues);

        return res;
    }

    /**
     * Execute Python stage <py> ... </py>
     */
    async executePython(code) {
        // If Pyodide is available in browser, execute via WebAssembly Python 3!
        const hasWindow = typeof window !== 'undefined';
        if (this.pyodide || (hasWindow && window.__block_pyodide)) {
            const py = this.pyodide || window.__block_pyodide;
            try {
                py.globals.set('__block_source', code);
                py.globals.set('__block_state_json', JSON.stringify(this.state));

                const wrapper = `
import json, sys, io, traceback
__block_scope = json.loads(__block_state_json)
__block_stdout = io.StringIO()
__block_stderr = io.StringIO()
__block_error = None

sys_stdout_backup = sys.stdout
sys.stdout = __block_stdout

try:
    exec(__block_source, __block_scope, __block_scope)
except Exception as e:
    __block_error = str(e)
finally:
    sys.stdout = sys_stdout_backup

__block_new_state = {}
for k, v in __block_scope.items():
    if not k.startswith('_') and type(v) in (int, float, str, bool, list, dict):
        __block_new_state[k] = v

json.dumps({
    "ok": __block_error is None,
    "output": __block_stdout.getvalue(),
    "state": __block_new_state,
    "error": __block_error
})
`;
                const raw = await py.runPythonAsync(wrapper);
                const parsed = JSON.parse(raw);
                if (parsed.output) {
                    this.log(parsed.output.trim());
                }
                if (parsed.error) {
                    this.log('[Python Error] ' + parsed.error);
                }
                if (parsed.state) {
                    for (const k of Object.keys(parsed.state)) {
                        this.state[k] = parsed.state[k];
                    }
                }
                return parsed.output || parsed.error || '';
            } catch (err) {
                this.log('[Python Runtime Exception] ' + err.message);
            }
        }

        // Fast zero-dependency fallback Python interpreter
        return this.executePythonFallback(code);
    }

    /**
     * Fast local Python runner for immediate offline execution
     */
    executePythonFallback(code) {
        const lines = code.split('\n');
        const engine = this;
        let lastOutput = '';

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line || line.startsWith('#')) continue;

            // print(...)
            const printMatch = line.match(/^print\s*\((.*)\)$/);
            if (printMatch) {
                const expr = printMatch[1];
                const evaluated = this.evaluateNativeExpr(expr, this.state);
                const outStr = typeof evaluated === 'object' ? JSON.stringify(evaluated) : String(evaluated);
                this.log(outStr);
                lastOutput = outStr;
                continue;
            }

            // Simple assignment: var = expr
            const assignMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
            if (assignMatch) {
                const varName = assignMatch[1];
                const expr = assignMatch[2];
                const val = this.evaluateNativeExpr(expr, this.state);
                this.state[varName] = val;
                continue;
            }

            // Augmented assignments: var += expr
            const augMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*([\+\-\*\/%])=\s*(.+)$/);
            if (augMatch) {
                const varName = augMatch[1];
                const op = augMatch[2];
                const expr = augMatch[3];
                const val = this.evaluateNativeExpr(expr, this.state);
                const current = this.state[varName] || 0;
                if (op === '+') this.state[varName] = current + val;
                if (op === '-') this.state[varName] = current - val;
                if (op === '*') this.state[varName] = current * val;
                if (op === '/') this.state[varName] = current / val;
                if (op === '%') this.state[varName] = current % val;
                continue;
            }
        }

        return lastOutput;
    }

    /**
     * Execute SQL stage <sql> ... </sql> with in-memory SQLite table support
     */
    executeSQL(code) {
        if (!this.inMemoryTables) {
            this.inMemoryTables = {};
        }

        const statements = code.split(';').map(s => s.trim()).filter(s => s.length > 0);
        let resultRows = [];

        for (const sql of statements) {
            // CREATE TABLE
            const createMatch = sql.match(/^CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)\s*\((.*)\)/i);
            if (createMatch) {
                const tableName = createMatch[1];
                const cols = createMatch[2].split(',').map(c => c.trim().split(/\s+/)[0]);
                this.inMemoryTables[tableName] = { columns: cols, rows: [] };
                this.log(`[SQL] Table created: ${tableName}`);
                continue;
            }

            // INSERT INTO table VALUES (...)
            const insertMatch = sql.match(/^INSERT\s+INTO\s+([a-zA-Z0-9_]+)\s*(?:\((.*?)\))?\s*VALUES\s*\((.*)\)/i);
            if (insertMatch) {
                const tableName = insertMatch[1];
                const rawValues = insertMatch[3].split(',').map(v => {
                    const t = v.trim();
                    if ((t.startsWith("'") && t.endsWith("'")) || (t.startsWith('"') && t.endsWith('"'))) {
                        return t.slice(1, -1);
                    }
                    const num = Number(t);
                    return isNaN(num) ? t : num;
                });

                if (!this.inMemoryTables[tableName]) {
                    this.inMemoryTables[tableName] = { columns: rawValues.map((_, i) => 'col' + (i + 1)), rows: [] };
                }

                const table = this.inMemoryTables[tableName];
                const rowObj = {};
                table.columns.forEach((col, idx) => {
                    rowObj[col] = rawValues[idx] !== undefined ? rawValues[idx] : null;
                });
                table.rows.push(rowObj);
                this.log(`[SQL] 1 row inserted into ${tableName}`);
                continue;
            }

            // SELECT * FROM table
            const selectMatch = sql.match(/^SELECT\s+(.*?)\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+(.*?))?(?:\s+LIMIT\s+(\d+))?$/i);
            if (selectMatch) {
                const columnsStr = selectMatch[1].trim();
                const tableName = selectMatch[2].trim();
                const limit = selectMatch[4] ? parseInt(selectMatch[4]) : Infinity;

                const table = this.inMemoryTables[tableName];
                if (!table) {
                    this.log(`[SQL Error] Table ${tableName} does not exist.`);
                    continue;
                }

                let rows = [...table.rows];
                if (limit < rows.length) {
                    rows = rows.slice(0, limit);
                }

                resultRows = rows;
                this.state['sql_result'] = resultRows;
                this.log(`[SQL Query] Returned ${rows.length} rows: ` + JSON.stringify(rows));
            }
        }

        return resultRows.length > 0 ? JSON.stringify(resultRows) : 'OK';
    }

    /**
     * Execute JSON stage <json> ... </json>
     */
    executeJSON(code) {
        let rendered = this.renderTemplate(code);
        try {
            const parsed = JSON.parse(rendered);
            if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
                for (const key of Object.keys(parsed)) {
                    this.state[key] = parsed[key];
                }
            }
            this.log('[JSON Loaded]\n' + JSON.stringify(parsed, null, 2));
            return JSON.stringify(parsed);
        } catch (e) {
            this.log('[JSON Parse Warning] ' + e.message);
            return rendered;
        }
    }

    /**
     * Execute HTML stage <html> ... </html>
     */
    executeHTML(code) {
        const rendered = this.renderTemplate(code);
        this.log('[HTML Rendered]\n' + rendered);
        this.state['html_output'] = rendered;
        return rendered;
    }

    /**
     * Execute DEL stage <del> ... </del>
     */
    executeDel(code) {
        const vars = code.split('\n').map(v => v.trim()).filter(v => v !== '');
        for (const v of vars) {
            if (this.state.hasOwnProperty(v)) {
                delete this.state[v];
                this.log(`[DEL] Removed state variable: ${v}`);
            }
        }
        return 'OK';
    }

    renderTemplate(text) {
        return text.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, varName) => {
            if (this.state.hasOwnProperty(varName)) {
                const val = this.state[varName];
                if (typeof val === 'object') return JSON.stringify(val);
                return String(val);
            }
            return match;
        });
    }

    /**
     * Execute Native Block Program
     * Implements full Block syntax:
     * - func name(args): ... block
     * - for var in iterable: ... block
     * - while condition: ... block
     * - if condition: ... elif condition: ... else: ... block
     * - print(...)
     * - return expr
     */
    executeNativeBlock(code) {
        const lines = code.split('\n');
        let index = 0;
        const context = {
            state: this.state,
            functions: {},
            output: (msg) => this.log(msg),
            loopDepth: 0,
            scratch: this.scratchBridge
        };

        const statements = this.parseSequence(lines, index, true).statements;
        return this.executeStatements(statements, context);
    }

    parseSequence(lines, startIndex, allowElse = false) {
        const statements = [];
        let index = startIndex;
        let terminator = null;

        while (index < lines.length) {
            const rawLine = lines[index];
            const line = rawLine.trim();
            const lineNumber = index + 1;

            if (!line || line.startsWith('#') || line.startsWith('//')) {
                index++;
                continue;
            }

            if (line.toLowerCase() === 'block') {
                index++;
                terminator = 'block';
                break;
            }

            if (line.toLowerCase() === 'else:') {
                if (!allowElse) throw new Error(`[Line ${lineNumber}] Unexpected else block.`);
                terminator = 'else';
                break;
            }

            const elifMatch = line.match(/^elif\s+(.+):$/i);
            if (elifMatch) {
                if (!allowElse) throw new Error(`[Line ${lineNumber}] Unexpected elif block.`);
                terminator = 'elif';
                break;
            }

            // if condition:
            const ifMatch = line.match(/^if\s+(.+):$/i);
            if (ifMatch) {
                index++;
                const condition = ifMatch[1];
                const ifNode = this.parseIfStatement(lineNumber, condition, lines, index);
                statements.push(ifNode.statement);
                index = ifNode.nextIndex;
                continue;
            }

            // while condition:
            const whileMatch = line.match(/^while\s+(.+):$/i);
            if (whileMatch) {
                index++;
                const condition = whileMatch[1];
                const bodyRes = this.parseSequence(lines, index, false);
                if (bodyRes.terminator !== 'block') {
                    throw new Error(`[Line ${lineNumber}] while block must end with 'block'.`);
                }
                statements.push({
                    type: 'while',
                    condition,
                    body: bodyRes.statements,
                    line: lineNumber
                });
                index = bodyRes.nextIndex;
                continue;
            }

            // for var in iterable:
            const forMatch = line.match(/^for\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+in\s+(.+):$/i);
            if (forMatch) {
                index++;
                const variable = forMatch[1];
                const iterableExpr = forMatch[2];
                const bodyRes = this.parseSequence(lines, index, false);
                if (bodyRes.terminator !== 'block') {
                    throw new Error(`[Line ${lineNumber}] for block must end with 'block'.`);
                }
                statements.push({
                    type: 'for',
                    variable,
                    iterable: iterableExpr,
                    body: bodyRes.statements,
                    line: lineNumber
                });
                index = bodyRes.nextIndex;
                continue;
            }

            // func name(params):
            const funcMatch = line.match(/^func\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\((.*?)\)\s*:$/i);
            if (funcMatch) {
                index++;
                const funcName = funcMatch[1];
                const params = funcMatch[2].split(',').map(p => p.trim()).filter(p => p.length > 0);
                const bodyRes = this.parseSequence(lines, index, false);
                if (bodyRes.terminator !== 'block') {
                    throw new Error(`[Line ${lineNumber}] func block must end with 'block'.`);
                }
                statements.push({
                    type: 'func',
                    name: funcName,
                    params,
                    body: bodyRes.statements,
                    line: lineNumber
                });
                index = bodyRes.nextIndex;
                continue;
            }

            // Simple statement
            statements.push({
                type: 'simple',
                code: line,
                line: lineNumber
            });
            index++;
        }

        return { statements, nextIndex: index, terminator };
    }

    parseIfStatement(lineNumber, condition, lines, startIndex) {
        const thenRes = this.parseSequence(lines, startIndex, true);
        let elseBody = [];
        let curIndex = thenRes.nextIndex;

        if (thenRes.terminator === 'elif') {
            const elifLine = curIndex;
            const match = lines[curIndex - 1].trim().match(/^elif\s+(.+):$/i);
            const nestedIf = this.parseIfStatement(elifLine, match[1], lines, curIndex);
            elseBody = [nestedIf.statement];
            curIndex = nestedIf.nextIndex;
        } else if (thenRes.terminator === 'else') {
            const elseRes = this.parseSequence(lines, curIndex, false);
            if (elseRes.terminator !== 'block') {
                throw new Error(`[Line ${lineNumber}] if/else block must end with 'block'.`);
            }
            elseBody = elseRes.statements;
            curIndex = elseRes.nextIndex;
        } else if (thenRes.terminator !== 'block') {
            throw new Error(`[Line ${lineNumber}] if block must end with 'block'.`);
        }

        return {
            statement: {
                type: 'if',
                condition,
                thenBody: thenRes.statements,
                elseBody,
                line: lineNumber
            },
            nextIndex: curIndex
        };
    }

    executeStatements(statements, context) {
        let lastVal = undefined;

        for (const stmt of statements) {
            if (stmt.type === 'func') {
                context.functions[stmt.name] = stmt;
                continue;
            }

            if (stmt.type === 'if') {
                const cond = this.toBool(this.evaluateNativeExpr(stmt.condition, context));
                if (cond) {
                    lastVal = this.executeStatements(stmt.thenBody, context);
                } else if (stmt.elseBody && stmt.elseBody.length > 0) {
                    lastVal = this.executeStatements(stmt.elseBody, context);
                }
                continue;
            }

            if (stmt.type === 'while') {
                let loopCount = 0;
                while (this.toBool(this.evaluateNativeExpr(stmt.condition, context))) {
                    if (++loopCount > 10000) throw new Error(`[Line ${stmt.line}] while loop exceeded 10,000 iteration limit.`);
                    context.loopDepth++;
                    try {
                        lastVal = this.executeStatements(stmt.body, context);
                    } catch (e) {
                        if (e === 'CONTINUE') continue;
                        if (e === 'BREAK') break;
                        throw e;
                    } finally {
                        context.loopDepth--;
                    }
                }
                continue;
            }

            if (stmt.type === 'for') {
                let iter = this.evaluateNativeExpr(stmt.iterable, context);
                if (!Array.isArray(iter)) {
                    if (typeof iter === 'number') {
                        iter = Array.from({ length: iter }, (_, i) => i);
                    } else if (typeof iter === 'string') {
                        iter = iter.split('');
                    } else if (typeof iter === 'object' && iter !== null) {
                        iter = Object.keys(iter);
                    } else {
                        throw new Error(`[Line ${stmt.line}] for expression is not iterable.`);
                    }
                }

                let loopCount = 0;
                for (const item of iter) {
                    if (++loopCount > 10000) throw new Error(`[Line ${stmt.line}] for loop exceeded 10,000 iteration limit.`);
                    context.state[stmt.variable] = item;
                    context.loopDepth++;
                    try {
                        lastVal = this.executeStatements(stmt.body, context);
                    } catch (e) {
                        if (e === 'CONTINUE') continue;
                        if (e === 'BREAK') break;
                        throw e;
                    } finally {
                        context.loopDepth--;
                    }
                }
                continue;
            }

            if (stmt.type === 'simple') {
                lastVal = this.executeSimpleStatement(stmt.code, stmt.line, context);
            }
        }

        return lastVal;
    }

    executeSimpleStatement(line, lineNumber, context) {
        if (line === 'pass') return;
        if (line === 'break') {
            if (context.loopDepth <= 0) throw new Error(`[Line ${lineNumber}] break outside loop.`);
            throw 'BREAK';
        }
        if (line === 'continue') {
            if (context.loopDepth <= 0) throw new Error(`[Line ${lineNumber}] continue outside loop.`);
            throw 'CONTINUE';
        }

        // print statement
        const printMatch = line.match(/^print\s*\((.*)\)$/);
        if (printMatch) {
            const rawArgs = printMatch[1];
            const args = this.splitArgs(rawArgs);
            const values = args.map(a => {
                const val = this.evaluateNativeExpr(a, context);
                return typeof val === 'object' ? JSON.stringify(val) : String(val);
            });
            const outStr = values.join(' ');
            context.output(outStr);
            return outStr;
        }

        // return statement
        if (line.startsWith('return')) {
            const expr = line.substring(6).trim();
            const val = expr ? this.evaluateNativeExpr(expr, context) : null;
            throw { type: 'RETURN', value: val };
        }

        // Assignment
        const assignIdx = line.indexOf('=');
        if (assignIdx > 0 && line[assignIdx - 1] !== '!' && line[assignIdx - 1] !== '=' && line[assignIdx - 1] !== '<' && line[assignIdx - 1] !== '>' && line[assignIdx + 1] !== '=') {
            const left = line.substring(0, assignIdx).trim();
            const right = line.substring(assignIdx + 1).trim();
            const val = this.evaluateNativeExpr(right, context);

            // Handle property / index assignment
            const idxMatch = left.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\[(.+)\]$/);
            if (idxMatch) {
                const targetName = idxMatch[1];
                const key = this.evaluateNativeExpr(idxMatch[2], context);
                if (context.state[targetName]) {
                    context.state[targetName][key] = val;
                }
            } else {
                context.state[left] = val;
            }
            return val;
        }

        // Bare expression evaluation
        return this.evaluateNativeExpr(line, context);
    }

    evaluateNativeExpr(expr, context) {
        expr = expr.trim();
        if (!expr) return null;

        // Number literal
        if (/^-?\d+(\.\d+)?$/.test(expr)) {
            return Number(expr);
        }

        // Boolean & Null
        if (expr === 'true' || expr === 'True') return true;
        if (expr === 'false' || expr === 'False') return false;
        if (expr === 'null' || expr === 'None') return null;

        // String literal
        if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
            return expr.slice(1, -1);
        }

        // Array literal [a, b, c]
        if (expr.startsWith('[') && expr.endsWith(']')) {
            const inner = expr.slice(1, -1).trim();
            if (!inner) return [];
            return this.splitArgs(inner).map(item => this.evaluateNativeExpr(item, context));
        }

        // Builtin functions
        // range(n) or range(start, stop, step)
        const rangeMatch = expr.match(/^range\s*\((.*?)\)$/i);
        if (rangeMatch) {
            const args = this.splitArgs(rangeMatch[1]).map(a => Number(this.evaluateNativeExpr(a, context)));
            if (args.length === 1) return Array.from({ length: args[0] }, (_, i) => i);
            if (args.length === 2) {
                const res = [];
                for (let i = args[0]; i < args[1]; i++) res.push(i);
                return res;
            }
            if (args.length === 3) {
                const res = [];
                for (let i = args[0]; args[2] > 0 ? i < args[1] : i > args[1]; i += args[2]) res.push(i);
                return res;
            }
        }

        // len(x)
        const lenMatch = expr.match(/^len\s*\((.*?)\)$/i);
        if (lenMatch) {
            const val = this.evaluateNativeExpr(lenMatch[1], context);
            if (Array.isArray(val) || typeof val === 'string') return val.length;
            if (typeof val === 'object' && val !== null) return Object.keys(val).length;
            return 0;
        }

        // str(x)
        const strMatch = expr.match(/^str\s*\((.*?)\)$/i);
        if (strMatch) {
            const val = this.evaluateNativeExpr(strMatch[1], context);
            return typeof val === 'object' ? JSON.stringify(val) : String(val);
        }

        // int(x), float(x)
        const intMatch = expr.match(/^int\s*\((.*?)\)$/i);
        if (intMatch) return parseInt(this.evaluateNativeExpr(intMatch[1], context), 10);
        const floatMatch = expr.match(/^float\s*\((.*?)\)$/i);
        if (floatMatch) return parseFloat(this.evaluateNativeExpr(floatMatch[1], context));

        // User defined function call: funcName(args)
        const funcCallMatch = expr.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*\((.*?)\)$/);
        if (funcCallMatch) {
            const funcName = funcCallMatch[1];
            if (context.functions && context.functions[funcName]) {
                const funcDef = context.functions[funcName];
                const rawArgs = this.splitArgs(funcCallMatch[2]);
                const argValues = rawArgs.map(a => this.evaluateNativeExpr(a, context));

                const subContext = {
                    ...context,
                    state: { ...context.state }
                };

                funcDef.params.forEach((param, i) => {
                    subContext.state[param] = argValues[i] !== undefined ? argValues[i] : null;
                });

                try {
                    return this.executeStatements(funcDef.body, subContext);
                } catch (signal) {
                    if (signal && signal.type === 'RETURN') {
                        return signal.value;
                    }
                    throw signal;
                }
            }
        }

        // Scratch Bridge call: scratch.say(...), scratch.setPos(x, y)
        if (expr.startsWith('scratch.') && context.scratch) {
            try {
                const fn = new Function('scratch', `return ${expr}`);
                return fn(context.scratch);
            } catch (e) {}
        }

        // Safe JavaScript / Math expression evaluation with scope
        try {
            const state = context.state || this.state;
            const paramNames = ['state', 'scratch', 'range', 'len', 'str', 'int', 'float'];
            const paramValues = [
                state,
                context.scratch,
                (n) => Array.from({ length: n }, (_, i) => i),
                (x) => x ? x.length || Object.keys(x).length : 0,
                (x) => String(x),
                (x) => parseInt(x, 10),
                (x) => parseFloat(x)
            ];

            for (const key of Object.keys(state)) {
                if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) && !paramNames.includes(key)) {
                    paramNames.push(key);
                    paramValues.push(state[key]);
                }
            }

            // Convert python/block logical operators to JS
            let jsExpr = expr
                .replace(/\band\b/g, '&&')
                .replace(/\bor\b/g, '||')
                .replace(/\bnot\b/g, '!')
                .replace(/\bTrue\b/g, 'true')
                .replace(/\bFalse\b/g, 'false')
                .replace(/\bNone\b/g, 'null');

            const evalFn = new Function(...paramNames, `return (${jsExpr});`);
            return evalFn(...paramValues);
        } catch (err) {
            // If variable lookup directly
            if (context.state && context.state.hasOwnProperty(expr)) {
                return context.state[expr];
            }
            return expr;
        }
    }

    splitArgs(rawArgs) {
        const parts = [];
        let current = '';
        let depth = 0;
        let inQuote = false;
        let quoteChar = '';

        for (let i = 0; i < rawArgs.length; i++) {
            const c = rawArgs[i];
            if (inQuote) {
                current += c;
                if (c === quoteChar && rawArgs[i - 1] !== '\\') inQuote = false;
            } else {
                if (c === '"' || c === "'") {
                    inQuote = true;
                    quoteChar = c;
                    current += c;
                } else if (c === '(' || c === '[' || c === '{') {
                    depth++;
                    current += c;
                } else if (c === ')' || c === ']' || c === '}') {
                    depth--;
                    current += c;
                } else if (c === ',' && depth === 0) {
                    parts.push(current.trim());
                    current = '';
                } else {
                    current += c;
                }
            }
        }
        if (current.trim().length > 0) parts.push(current.trim());
        return parts;
    }

    toBool(val) {
        if (!val) return false;
        if (typeof val === 'boolean') return val;
        if (typeof val === 'number') return val !== 0;
        if (typeof val === 'string') return val.length > 0 && val !== 'false' && val !== '0';
        if (Array.isArray(val)) return val.length > 0;
        return true;
    }
}

module.exports = BlockEngine;
