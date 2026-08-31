# [WIP] Website deployment program built in:
### React.JS, TypeScript, Node.JS, Mongo.DB, Tailwind CSS

> **Project halted because of lack of hardware. Planning to buy a dedicated machine to use it as a remote server.**

### Creating deployments
In order to create a deployment you have to specify:
- the location of the deployment (local or from a remote server, in which case the connection will be established through SSH) 
- a name and a root folder path.

<img width="700" alt="image" src="https://github.com/user-attachments/assets/333b8985-872a-4c8c-b850-78ed08f33677" />

### Global Config and Environment diagnostic
Before deploying, the dashboard checks the host machine's readiness.

**OS settings**
- Detects whether nginx, certbot, and ufw are installed, and whether
  nginx/ufw are currently running/active
- Everything can be installed/activated using the buttons next to the text

**Provider settings**
Depending on the provider, you will be prompted to enter the relevant data needed to properly deploy the project

(in this case, only Cloudflare has been setup yet)

- Stores Cloudflare API token, zone ID, and base domain, used for DNS
  record management during deploys.

Status is shown per item (green = ready, red = needs attention), with
targeted actions available for the ones that can be safely automated.
<img width="700" alt="image" src="https://github.com/user-attachments/assets/70dbc99e-5109-41df-a543-2ac30170928c" />


### Deployment page
The deployment page contains everything necessary to manage your deployment. 
The first window contains the data required for the actual deployment.
#### Note: If your website does not require sub-routes, you can skip them entirely.
Now for a quick explanation of the deployment page, we start off with the first screen:
-  Sub-routes can be used to navigate individually to specified folders, where a process will run the commands you enter in the command field (the command you use to boot up your servers and your projects).
-  After filling in every input and hitting save, you will be able to deploy the project.
-  The child process id (pid) will be displayed, as well as the status of the deployment.

<img width="700" alt="image" src="https://github.com/user-attachments/assets/40e5931a-8130-4e25-ae06-a5f837137e72" />

On the right you will find data related to each deployment route, such as:
- **Logs** (saved both temporarily through MongoDB (last 100 logs) and permamently through a .txt file created in the dedicated folder.
  Each deployment run creates it's own individual .txt log file, thus allowing you to easily differentiate between them.
- **Pings**
- **SSL Certificate check**
- **Backups** that have been created.
  
<img width="700" alt="image" src="https://github.com/user-attachments/assets/1a86b797-aee4-496f-a17a-c743706c953b" />
<img width="700" alt="image" src="https://github.com/user-attachments/assets/5c70a486-aa26-417c-af39-0159e52152f1" />




