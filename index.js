const readline = require('readline')
const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt:">> "
  });

let config = {
    host : '192.168.0.101', // IP of the remote device
    username : 'u0_a361', // Username for SSH login
    password : '1234', // Password for SSH login
    port : 8022, // Specify the port number (for example, 2222)
}

// Maintain the current path
let currentPath = '~';

function disconnect_ssh()
{
    rl.close();
    ssh.dispose();
    console.log("Disconnected");
    process.exit(0);
}

function execcmd(command)
{
    const fullCommand = `cd ${currentPath} && ${command}`;
    ssh.execCommand(fullCommand).then((result)=>{
        console.log("output :-");
        console.log(result.stdout);
        if (result.stderr) console.error(result.stderr);
        rl.prompt(); 
    }).catch((err)=>{
        console.error('Error executing command:', err.message);
        rl.prompt();
    })
}

function CommandLineInterface()
{
    console.log("Command shell started...")
    rl.prompt();
    rl.on("line",(input)=>
    {
        const command = input.trim();
        if(command.toLowerCase() == 'exit')
        {
            console.log("exited... connection will be open");
            rl.prompt();
        }
        else if(command.toLowerCase() == "disconnect")
        {
            console.log("disconnected...")
            disconnect_ssh();
        }
        else if (command.includes('cd ')) {
            // Handle path changes
            const targetPath = command.slice(3).trim();
            const testCommand = `cd ${currentPath} && cd ${targetPath} && pwd`;

            ssh.execCommand(testCommand).then((result) => {
                if (result.stdout) {
                    currentPath = result.stdout.trim();
                    console.log(`Directory changed to: ${currentPath}`);
                } else if (result.stderr) {
                    console.error(`Failed to change directory: ${result.stderr}`);
                }
                rl.prompt();
            }).catch((err) => {
                console.error('Error changing directory:', err.message);
                rl.prompt();
            });
        }
        else{
            execcmd(command);
        }
    })
}

function Connect_to_device()
{
    console.log("Connecting....");
    ssh.connect(config).then(()=>{
        console.log("Connected...");
        CommandLineInterface()
    })
    .catch((err)=>{
        console.log("Connection failed...")
        console.error(err);
        disconnect_ssh();
    })
}

Connect_to_device();