# 🚀 Configuración del proxy de GitHub Stats en Vercel
# 🚀 GitHub Stats Vercel Proxy — Setup Guide

> **ES:** Esta guía explica cómo desplegar las funciones de proxy en Vercel para que las tarjetas de estadísticas del README no dependan directamente de servicios externos y sean más estables.
>
> **EN:** This guide explains how to deploy the proxy functions on Vercel so the README stats cards don't depend directly on third-party services, making them more reliable.

---

## ¿Qué hace esto? / What does this do?

En lugar de cargar las imágenes desde `github-readme-stats.vercel.app` y `streak-stats.demolab.com` directamente (donde a veces hay saturación), el README ahora apunta a **tres endpoints propios en Vercel**:

| Endpoint | Descripción |
|---|---|
| `/api/stats` | Tarjeta de estadísticas generales |
| `/api/streak` | Tarjeta de racha de commits |
| `/api/languages` | Tarjeta de lenguajes más usados |

Cada endpoint hace una petición al servicio externo, devuelve el SVG y le dice a la CDN de Vercel que lo guarde **1 hora** en caché. Así se reduce drásticamente el número de peticiones a las APIs externas.

---

## Requisitos previos / Prerequisites

- Una cuenta gratuita en [vercel.com](https://vercel.com) (puedes iniciar sesión con tu cuenta de GitHub).
- El repositorio `P-P-programer/P-P-programer` en tu cuenta de GitHub (ya lo tienes).

---

## Paso 1 — Importar el proyecto en Vercel / Import the project in Vercel

1. Ve a [vercel.com/new](https://vercel.com/new).
2. Haz clic en **"Import Git Repository"**.
3. Conecta tu cuenta de GitHub si aún no lo has hecho.
4. Busca y selecciona el repositorio **`P-P-programer/P-P-programer`**.
5. En **"Project Name"**, escribe `p-p-programer-stats` (o el nombre que prefieras).
6. Deja todo lo demás por defecto y haz clic en **Deploy**.

> **Nota:** Vercel detecta automáticamente las funciones dentro de la carpeta `api/` y las despliega como serverless functions.

---

## Paso 2 — Anotar la URL del proyecto / Note the project URL

Una vez desplegado, Vercel te mostrará una URL similar a:

```
https://p-p-programer-stats.vercel.app
```

Toma nota de esta URL; la necesitarás en el Paso 4.

---

## Paso 3 (Opcional pero recomendado) — Configurar el token de GitHub / Configure the GitHub token

Sin token, las peticiones a la API de GitHub cuentan como anónimas (límite de 60 req/hora). Con un token personal subes a 5 000 req/hora.

### Crear el token

1. Ve a [github.com/settings/tokens](https://github.com/settings/tokens) → **"Generate new token (classic)"**.
2. Selecciona solo el permiso **`public_repo`** (o `repo` si quieres incluir repos privados en las stats).
3. Copia el token generado.

### Agregar el token en Vercel

1. En el dashboard de tu proyecto en Vercel, ve a **Settings → Environment Variables**.
2. Agrega estas variables:

   | Name | Value |
   |---|---|
   | `GITHUB_TOKEN` | El token que acabas de copiar |
   | `GITHUB_USERNAME` | `P-P-programer` (opcional, ya está en el código por defecto) |

3. Haz clic en **Save** y luego en **Redeploy** para que las variables tomen efecto.

---

## Paso 4 — Actualizar el README / Update the README

Abre el archivo `README.md` y reemplaza `p-p-programer-stats.vercel.app` con la URL real de tu proyecto si es diferente.

La sección relevante del README ya está actualizada para apuntar a:

```
https://p-p-programer-stats.vercel.app/api/stats
https://p-p-programer-stats.vercel.app/api/streak
https://p-p-programer-stats.vercel.app/api/languages
```

Si tu URL de Vercel es diferente, simplemente haz un buscar-y-reemplazar de `p-p-programer-stats.vercel.app` con tu URL real.

---

## Verificar que funciona / Verify it works

Abre en el navegador:

```
https://p-p-programer-stats.vercel.app/api/stats
https://p-p-programer-stats.vercel.app/api/streak
https://p-p-programer-stats.vercel.app/api/languages
```

Deberías ver las tarjetas SVG. Si ves un error, revisa los logs en **Vercel Dashboard → Functions → Logs**.

---

## Caché / Cache

Las respuestas se guardan en la CDN de Vercel durante **1 hora** (`s-maxage=3600`). Mientras el caché es válido, las peticiones se sirven desde la CDN sin llegar a los servicios externos. Después de 1 hora, el primer visitante dispara una revalidación en segundo plano (`stale-while-revalidate=86400`), por lo que las imágenes **nunca se quedan en blanco** incluso durante la actualización.

---

## Seguridad / Security

- El `GITHUB_TOKEN` **nunca** debe estar en el código fuente, solo en las variables de entorno de Vercel.
- Revoca el token en [github.com/settings/tokens](https://github.com/settings/tokens) si sospechas que se ha comprometido.
