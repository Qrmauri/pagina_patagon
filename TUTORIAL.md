# 🛍️ Tutorial: Cómo acceder a Patagon Store

## Paso 1: Abre PowerShell o CMD

Busca **PowerShell** en el menú de inicio de Windows y abrelo.

## Paso 2: Navega a la carpeta del proyecto

Copia y pega esto en PowerShell:

```powershell
cd 'c:\Users\mauri\ejercicios\clases phyton\ejercicio_front_end\pagina_8'
```

Presiona **Enter**.

## Paso 3: Inicia el servidor de desarrollo

Escribe o copia:

```powershell
npm run dev
```

Presiona **Enter**.

Verás algo como esto:

```
> pagina_8@0.0.0 dev
> vite

  VITE v8.0.16  ready in 314 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

✅ **¡El servidor está activo!** No cierres esta ventana de PowerShell.

## Paso 4: Abre Brave (o cualquier navegador)

Tienes 3 opciones:

### Opción A: Comando desde otra PowerShell (Recomendado)
Abre **otra ventana de PowerShell** y ejecuta:

```powershell
& 'C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe' http://localhost:5173/
```

### Opción B: Manualmente desde Brave
1. Abre **Brave**
2. En la barra de direcciones, copia esta URL:
   ```
   http://localhost:5173/
   ```
3. Presiona **Enter**

### Opción C: Chrome o Firefox
Abre cualquier navegador (Chrome, Firefox, Edge) e ingresa:
```
http://localhost:5173/
```

## ✅ ¡Listo!

Ahora deberías ver **Patagon Store** con:
- 🎨 Navbar con el logo y menú
- 🌟 Sección Hero (bienvenida)
- 📊 Estadísticas de la tienda
- 🔍 Buscador y filtros por categoría
- 🛒 6 productos (juguetes, electrónica, libros)

## 🎮 Prueba las funciones

1. **Filtrar por categoría**: Haz clic en "⚡ Electrónica", "🧸 Juguetes" o "📚 Libros"
2. **Buscar**: Escribe algo en el buscador (ej: "consola", "libro")
3. **Limpiar filtro**: Borra el texto del buscador y aparecerán todos los productos

## 🛑 Cómo detener el servidor

En la ventana de PowerShell donde corre `npm run dev`, presiona:
```
Ctrl + C
```

Confirma con **Y** si te lo pregunta.

## 📝 Notas importantes

- **NO cierres** la ventana de PowerShell con `npm run dev` mientras estés usando la página
- Los cambios en los archivos se verán automáticamente en el navegador (Hot Module Reload)
- La URL siempre es: `http://localhost:5173/`
- Puedes usar cualquier navegador (Brave, Chrome, Firefox, Edge)

---

¿Necesitas agregar más productos o cambiar algo? ¡Avísame! 😊
