# 🔐 Configuración de SSH Keys para Deploy Automático

## Problema Actual
- SSH pide contraseña cada vez
- GitHub pide credenciales
- No hay persistencia entre comandos

## ✅ Solución: SSH Keys + GitHub SSH

### 1️⃣ Generar SSH Key (si no tienes una)

```powershell
# En tu máquina Windows
ssh-keygen -t ed25519 -C "tu-email@example.com"
# Presiona Enter 3 veces (sin passphrase para deploy automático)
```

### 2️⃣ Copiar la clave pública al VPS

```powershell
# Ver tu clave pública
Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub

# Copiar manualmente al servidor
ssh deploy@212.227.94.64
mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys
# Pegar la clave pública y guardar (Ctrl+X, Y, Enter)
chmod 600 ~/.ssh/authorized_keys
exit
```

### 3️⃣ Probar conexión sin contraseña

```powershell
ssh deploy@212.227.94.64
# Debería conectar SIN pedir contraseña
```

### 4️⃣ Configurar GitHub con SSH

```powershell
# Agregar la misma clave a GitHub
# 1. Ve a https://github.com/settings/keys
# 2. Click "New SSH key"
# 3. Pega el contenido de id_ed25519.pub
# 4. Guarda

# Cambiar el remote de HTTPS a SSH
git remote set-url origin git@github.com:RikiBalthazar/fichaje.git

# Probar conexión
ssh -T git@github.com
```

### 5️⃣ Configurar SSH en el VPS para GitHub

```bash
# En el VPS (después de conectarte con SSH)
ssh-keygen -t ed25519 -C "deploy@vps"
# Enter 3 veces

# Ver la clave pública del VPS
cat ~/.ssh/id_ed25519.pub

# Agregar esta clave TAMBIÉN a GitHub
# https://github.com/settings/keys (con título "VPS Deploy Key")

# Probar en el VPS
ssh -T git@github.com

# Cambiar remote a SSH en el VPS
cd /opt/fichaje
git remote set-url origin git@github.com:RikiBalthazar/fichaje.git
```

---

## 🚀 Uso del Script de Deploy

Una vez configurado SSH:

```powershell
# Deploy completo con un solo comando
.\deploy.ps1
```

El script:
1. ✅ Hace commit y push a GitHub (sin pedir contraseña)
2. ✅ Se conecta al VPS (sin pedir contraseña)
3. ✅ Hace pull del código nuevo
4. ✅ Construye el cliente
5. ✅ Reinicia el servidor PM2

---

## 📋 Archivo de Configuración

`.deploy-config.json` contiene todos los datos de conexión:
- Host y usuario del VPS
- Ruta del proyecto
- Proceso PM2
- Repositorio de GitHub

Si cambias algo (ej: usuario, path), solo edita ese archivo.

---

## 🔒 Seguridad

**Importante:** Nunca subas tu clave **privada** (`id_ed25519`) a GitHub.

Ya añadido al `.gitignore`:
- `.deploy-config.json`
- `deploy.ps1`

Solo tú tendrás estos archivos localmente.

---

## 🆘 Troubleshooting

### SSH sigue pidiendo contraseña
```powershell
# Verificar que la clave esté cargada
ssh-add -l

# Si no está, agregarla
ssh-add $env:USERPROFILE\.ssh\id_ed25519
```

### Git push pide contraseña
```bash
# Verificar que uses SSH, no HTTPS
git remote -v
# Debe decir: git@github.com:RikiBalthazar/fichaje.git
# NO: https://github.com/RikiBalthazar/fichaje.git
```

### Permisos en VPS
```bash
# Los permisos de SSH deben ser estrictos
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chmod 600 ~/.ssh/id_ed25519
```

---

## ✅ Checklist de Configuración

- [ ] Generar SSH key en Windows
- [ ] Copiar clave pública al VPS (`~/.ssh/authorized_keys`)
- [ ] Probar SSH sin contraseña: `ssh deploy@212.227.94.64`
- [ ] Agregar clave pública a GitHub (Settings → SSH Keys)
- [ ] Cambiar git remote a SSH: `git remote set-url origin git@github.com:...`
- [ ] Probar git push sin contraseña
- [ ] Generar SSH key en el VPS
- [ ] Agregar clave pública del VPS a GitHub
- [ ] Cambiar remote a SSH en el VPS
- [ ] Probar `.\deploy.ps1`

---

**Tiempo estimado:** 10-15 minutos  
**Beneficio:** Deploy automático en 1 comando, sin contraseñas
