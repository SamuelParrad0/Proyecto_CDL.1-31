# Manual de publicacion en Windows Server

## 1. Objetivo

Este proyecto tiene:

- Backend Node.js ejecutandose internamente en el puerto `5000`.
- Frontend React que se compila en la carpeta `frontend/build`.
- Servidor Windows Server 2022.
- IP publica: `18.209.145.233`.
- Puerto publico: `80`.

Al finalizar, los usuarios entraran desde:

```text
http://18.209.145.233/
```

El usuario no necesitara escribir `:3000` ni `:5000`.

## 2. Como funciona la publicacion

El archivo `scripts/servidor-produccion.js` funciona como una puerta de entrada:

```text
Usuario externo
      |
      | http://18.209.145.233:80
      v
Gateway Node en puerto 80
      |------------------------|
      |                        |
      v                        v
Frontend React             Backend Node
frontend/build             127.0.0.1:5000
      |                        |
      |                        v
      |                     MySQL
      v
Navegador
```

Las rutas funcionan asi:

- `/` y las demas pantallas React se sirven desde `frontend/build`.
- `/api/...` se reenvia al backend en `127.0.0.1:5000`.
- `/uploads/...` se reenvia al backend en `127.0.0.1:5000`.

No se usa IIS, URL Rewrite ni ARR en esta implementacion. Esto evita tener que instalar esos componentes.

## 3. Archivos modificados

### 3.1 `frontend/src/servicios/api.js`

Antes el frontend siempre llamaba a:

```javascript
const API_URL = 'http://localhost:5000/api';
```

Eso solo funciona en el mismo computador donde esta el backend. En un navegador externo, `localhost` significa el computador del usuario.

Ahora usa:

```javascript
const API_URL = process.env.REACT_APP_API_URL || '/api';
```

Esto permite que React use la ruta `/api` del mismo servidor publico.

### 3.2 `backend/backend/.env`

Se cambiaron las variables de produccion:

```text
NODE_ENV=production
FRONTEND_URL=http://18.209.145.233
BASE_URL=http://18.209.145.233
```

`FRONTEND_URL` permite que CORS acepte solicitudes del frontend publico.

`BASE_URL` representa la direccion publica para enlaces y archivos.

### 3.3 `scripts/publicar-produccion.ps1`

Este es el instalador y publicador automatico. Hace lo siguiente:

1. Comprueba que PowerShell tenga permisos de Administrador.
2. Comprueba que existan Node.js y npm.
3. Comprueba el archivo `backend/backend/.env`.
4. Instala las dependencias del frontend con `npm ci`.
5. Construye el frontend con `npm run build`.
6. Instala las dependencias del backend con `npm ci`.
7. Inicia el backend en el puerto `5000` si no esta iniciado.
8. Abre el puerto `80` en el Firewall de Windows.
9. Bloquea el puerto `5000` para conexiones externas.
10. Inicia el gateway Node en el puerto `80`.

## 4. Archivo creado

### 4.1 `frontend/.env.production`

Contiene:

```text
REACT_APP_API_URL=/api
```

React lee esta variable durante `npm run build`. Por eso se debe volver a construir el frontend cada vez que cambie esta configuracion.

### 4.2 `scripts/servidor-produccion.js`

Este gateway:

- Escucha en `0.0.0.0:80`.
- Entrega el archivo `frontend/build/index.html`.
- Entrega JavaScript, CSS, imagenes y fuentes.
- Usa `index.html` como respaldo para las rutas de React.
- Reenvia las solicitudes `/api` al backend.
- Reenvia las solicitudes `/uploads` al backend.
- Devuelve un error `502` si el backend no esta disponible.

## 5. Requisitos del servidor

En Windows Server se necesita:

1. Node.js LTS instalado.
2. npm incluido con Node.js.
3. MySQL funcionando y accesible.
4. La base de datos `cdl_db` creada.
5. El codigo completo del proyecto copiado al servidor.
6. El puerto TCP `80` permitido en AWS, router o firewall externo.
7. PowerShell ejecutado como Administrador.

Para comprobar Node.js y npm:

```powershell
node --version
npm --version
```

Si alguno de los comandos no existe, instala Node.js LTS desde:

```text
https://nodejs.org/
```

Despues de instalarlo, cierra y vuelve a abrir PowerShell.

## 6. Preparar la base de datos

Antes de publicar, confirma que MySQL este iniciado.

Revisa estos valores en `backend/backend/.env`:

```text
DB_HOST=localhost
DB_PORT=3306
DB_NAME=cdl_db
DB_USER=root
DB_PASSWORD=
```

Si tu usuario, contrasena, puerto o nombre de base de datos son diferentes, actualiza esos valores.

Prueba el backend manualmente:

```powershell
cd C:\Users\Administrator\Documents\GitHub\Proyecto_CDL.1-31\backend\backend
npm start
```

Debe mostrar que se conecto a MySQL y que el servidor esta ejecutandose en el puerto `5000`.

Para detenerlo, presiona:

```text
Ctrl + C
```

Si `npm start` termina con error, revisa primero MySQL y los valores de `backend/backend/.env`.

## 7. Ejecutar la publicacion

Abre PowerShell como Administrador.

Ve a la carpeta raiz del proyecto:

```powershell
cd C:\Users\Administrator\Documents\GitHub\Proyecto_CDL.1-31
```

Permite la ejecucion del script solo durante esa ventana:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
```

Ejecuta el publicador:

```powershell
.\scripts\publicar-produccion.ps1
```

El proceso puede tardar porque ejecuta `npm ci` y construye React.

Al terminar correctamente, debe aparecer un mensaje parecido a:

```text
Publicacion terminada: http://18.209.145.233/
El backend permanece interno en 127.0.0.1:5000.
```

## 8. Comprobar desde el mismo servidor

Prueba primero el frontend:

```powershell
Invoke-WebRequest http://127.0.0.1/ -UseBasicParsing
```

El resultado esperado es codigo HTTP `200`.

Prueba el backend directamente:

```powershell
Invoke-WebRequest http://127.0.0.1:5000/ -UseBasicParsing
```

El resultado esperado es un JSON indicando que el backend funciona.

Prueba el backend a traves del gateway:

```powershell
Invoke-WebRequest http://127.0.0.1/api/ -UseBasicParsing
```

Esta ultima prueba puede devolver `404` si la ruta `/api/` no existe como ruta general, pero no debe devolver `502`. Un `502` significa que el gateway no logra conectarse al backend.

## 9. Comprobar desde otro computador

Desde un computador externo abre un navegador y escribe:

```text
http://18.209.145.233/
```

Prueba iniciar sesion, consultar productos y cargar imagenes.

Si desde el servidor funciona pero desde Internet no funciona, revisa el firewall del proveedor. En AWS revisa el Security Group y agrega una regla:

```text
Tipo: HTTP
Protocolo: TCP
Puerto: 80
Origen: 0.0.0.0/0
```

Para produccion real es preferible limitar el origen cuando sea posible y configurar HTTPS.

## 10. Errores comunes

### Error: "Ejecuta PowerShell como Administrador"

Cierra PowerShell. Busca PowerShell en el menu Inicio, haz clic derecho y selecciona **Ejecutar como administrador**.

### Error: "No se encontro node o npm"

Node.js no esta instalado o no esta en el PATH. Instala Node.js LTS y vuelve a abrir PowerShell.

### Error: "backend/.env debe contener NODE_ENV=production"

Abre `backend/backend/.env` y verifica:

```text
NODE_ENV=production
FRONTEND_URL=http://18.209.145.233
```

### Error: "La compilacion no genero frontend/build/index.html"

Ejecuta manualmente:

```powershell
cd C:\Users\Administrator\Documents\GitHub\Proyecto_CDL.1-31\frontend
npm ci
npm run build
```

Si falla, copia el mensaje de error completo.

### Error: `EADDRINUSE` o "address already in use"

El puerto `80` o `5000` ya esta ocupado.

Consulta los procesos:

```powershell
Get-NetTCPConnection -LocalPort 80,5000 -State Listen
```

Consulta que proceso usa cada puerto:

```powershell
Get-Process -Id <PID>
```

Reemplaza `<PID>` por el numero mostrado.

### Error `502 Backend no disponible`

El gateway esta funcionando, pero el backend no.

Comprueba:

```powershell
Invoke-WebRequest http://127.0.0.1:5000/ -UseBasicParsing
```

Si falla, inicia el backend:

```powershell
cd C:\Users\Administrator\Documents\GitHub\Proyecto_CDL.1-31\backend\backend
npm start
```

Revisa tambien la conexion a MySQL.

### La pagina abre, pero el login falla

Abre las herramientas del navegador con `F12` y revisa la pestaña **Console** o **Network**.

Comprueba que las solicitudes vayan a:

```text
http://18.209.145.233/api/...
```

No deben ir a:

```text
http://localhost:5000/api/...
```

Si aparece un error de CORS, revisa `FRONTEND_URL` en `backend/backend/.env` y reinicia el backend.

### La pagina funciona en el servidor, pero no desde Internet

Revisa, en este orden:

1. Regla TCP 80 en el Security Group de AWS.
2. Firewall de Windows.
3. Que la IP publica siga siendo `18.209.145.233`.
4. Que el gateway siga ejecutandose.
5. Que ningun otro programa use el puerto 80.

## 11. Ver los procesos activos

Para comprobar el backend y el gateway:

```powershell
Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" |
  Select-Object ProcessId, CommandLine
```

Debe aparecer un proceso con `server.js` y otro con `servidor-produccion.js`.

## 12. Reiniciar la aplicacion

Busca y detiene los procesos Node relacionados:

```powershell
Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" |
  Where-Object { $_.CommandLine -match 'server\.js|servidor-produccion\.js' } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
```

Despues ejecuta de nuevo:

```powershell
cd C:\Users\Administrator\Documents\GitHub\Proyecto_CDL.1-31
.\scripts\publicar-produccion.ps1
```

## 13. Actualizar el sistema despues de cambiar codigo

Cada vez que cambies el frontend o el backend:

1. Copia los cambios al servidor.
2. Deten los procesos Node existentes.
3. Ejecuta el publicador otra vez.
4. Borra la cache del navegador con `Ctrl + F5`.
5. Prueba el login y las funciones principales.

El publicador ejecuta `npm ci`, vuelve a construir React y reinicia solo los procesos que no esten ejecutandose.

## 14. Importante sobre reinicios del servidor

El script inicia los procesos, pero esta version no instala Node como servicio de Windows. Si el servidor se reinicia, tendras que ejecutar nuevamente el script.

Para un entorno permanente se recomienda configurar el gateway y el backend como servicios de Windows usando una herramienta como NSSM o el Programador de tareas.

## 15. Seguridad antes de usar el sistema

Antes de utilizar el sistema con usuarios reales:

1. Cambia `JWT_SECRET` por una clave larga y privada.
2. Cambia `ADMIN_REGISTRATION_KEY`.
3. Configura HTTPS con un certificado.
4. No publiques directamente el puerto `5000`.
5. Usa una contrasena para MySQL.
6. No compartas los archivos `.env`.
7. Haz copias de seguridad de la base de datos.

## 16. Resumen rapido

```powershell
cd C:\Users\Administrator\Documents\GitHub\Proyecto_CDL.1-31
Set-ExecutionPolicy Bypass -Scope Process -Force
.\scripts\publicar-produccion.ps1
```

Abrir en el navegador:

```text
http://18.209.145.233/
```

Archivos principales de esta implementacion:

- `frontend/src/servicios/api.js`
- `frontend/.env.production`
- `backend/backend/.env`
- `scripts/servidor-produccion.js`
- `scripts/publicar-produccion.ps1`
