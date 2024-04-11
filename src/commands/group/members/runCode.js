const handler = async (sock, msg, from, args, msgInfoObj) => {
    const codeReceived = args.join(" ");
    const { sendMessageWTyping } = msgInfoObj;
    try {
        // Use a custom function to capture the output of console.log
        let consoleOutput = '';
        const captureConsoleLog = message => {
            consoleOutput += message + '\n';
        };
        const consoleLogProxy = new Proxy(console.log, {
            apply: (target, thisArg, argumentsList) => {
                captureConsoleLog(argumentsList.join(' '));
                Reflect.apply(target, thisArg, argumentsList);
            }
        });
        const sandbox = { console: { log: consoleLogProxy } };

        // Evaluate the code in a sandboxed environment
        const result = await evalInContext(codeReceived, sandbox);

        // Check if the result is a string or an object
        const resultText = typeof result === 'string' ? result : JSON.stringify(result);

        // Send the captured console output and the result as a text message
        sendMessageWTyping(from, { text: `Console Output:\n${consoleOutput}\nResult: ${resultText}` }, { quoted: msg });
    }
    catch (err) {
        console.log(err);
        sendMessageWTyping(from, { text: `❌ Error: ${err.toString()}` }, { quoted: msg });
    }
}

// Function to evaluate code in a sandboxed environment
const evalInContext = async (code, context) => {
    const vm = require('vm');
    const sandbox = { ...context };
    const script = new vm.Script(code);
    const result = script.runInNewContext(sandbox);
    return result;
}

module.exports.command = () => ({ cmd: ['exec', 'execute'], handler });
