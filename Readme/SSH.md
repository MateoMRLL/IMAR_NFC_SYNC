# SSH Setup Guide (First-Time Use)

**Date:** 2025-09-16  
**Author:** Matéo MARILL  

---

## 1. Objective
This guide explains how to generate SSH keys, configure public key authentication, and connect securely to a remote server for the first time.

---

## 2. Key Concepts

- `ssh-keygen` is the tool used to create SSH key pairs (public/private).  
- Public key authentication is more secure than password-based login: the client proves it owns the private key without ever sending it.  
- The private key must be kept safe, while the public key can be shared with servers.  

Reference: [SSH.com - ssh-keygen](https://www.ssh.com/academy/ssh/keygen)

---

## 3. Generate an SSH Key Pair

1. Open a terminal (Linux/macOS) or PowerShell/Windows Terminal (I'm always using Linux terminal so I don't know if ssh command are working on a Windows Terminal).  
2. Run the following command:
   ```bash
   ssh-keygen
   ```
You can also customize `ssh-keygen` using different algorithms : 

```bash 
ssh-keygen -t rsa -b 4096
ssh-keygen -t ecdsa -b 521
ssh-keygen -t ed25519
```

Press enter (if you don't want to configure anything).
## 4. Install public SSH Key on a server

Use this command : 
`ssh-copy-id remote_user@remote_server_ip`
