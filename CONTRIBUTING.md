# 🤝 Guía para contribuidores

¡Gracias por tu interés en contribuir al Sistema de Fichaje! 

## Cómo empezar

1. Fork el repositorio
2. Clona tu fork: `git clone <tu-fork>`
3. Crea una rama: `git checkout -b feature/mi-feature`
4. Realiza tus cambios
5. Escribe tests
6. Abre un Pull Request

## Estándares de código

### TypeScript

- Siempre usa tipos explícitos
- Evita `any` en lo posible
- Documenta funciones complejas con JSDoc

```typescript
/**
 * Calcula tiempo centesimal
 * @param minutes Minutos totales
 * @returns Formato "H:MM"
 */
export function convertMinutesToCentesimal(minutes: number): string {
  // ...
}
```

### React Components

- Usa functional components y hooks
- Memorizá callbacks con `useCallback`
- Limpia efectos en el return de `useEffect`
- Props con TypeScript interfaces

```typescript
interface MyComponentProps {
  projectId: string;
  onSave?: (data: Project) => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ projectId, onSave }) => {
  // ...
};
```

### Estilos

- Usa TailwindCSS, no CSS tradicional
- Mantén coherencia de colores y espaciado
- Responsive first (mobile-first)

### Naming

- Componentes: PascalCase (`ProjectCard.tsx`)
- Funciones: camelCase (`handlePlayProject`)
- Constantes: UPPER_SNAKE_CASE (`DEFAULT_PORT = 3000`)
- Archivos: lowercase con guiones (`time-entry.ts`)

## Testing

Antes de hacer commit, ejecuta los tests:

```bash
# Cliente
cd client
npm test

# Servidor
cd server
npm test
```

Escribe tests para:
- Funciones de utilidad
- Convertidores (centesimal)
- Controladores principales

## Commits

Usa conventional commits:

```
feat: Agregar nuevo componente XYZ
fix: Corregir bug en cronómetro
docs: Actualizar README
test: Añadir tests de integración
chore: Actualizar dependencias
```

## Reportar bugs

1. Usa el formato de issue
2. Incluye pasos para reproducir
3. Captura de pantalla si es visual
4. Versión de Node.js y navegador

### Ejemplo

```
**Descripción del bug**
El cronómetro se detiene cuando cambio de pestaña

**Pasos para reproducir**
1. Iniciar cronómetro en proyecto
2. Cambiar a otra pestaña del navegador
3. Volver a la tab

**Comportamiento esperado**
El cronómetro debe seguir corriendo

**Comportamiento actual**
El cronómetro se pausa

**Entorno**
- OS: Windows 11
- Node: v18.0.0
- Navegador: Chrome 120
```

## Solicitudes de features

Describe:
- Caso de uso
- Por qué es importante
- Alternativas consideradas

### Ejemplo

```
**Feature: Exportación a CSV**

Muchos usuarios quieren importar sus datos en Excel.
Actualmente solo soportamos TXT.

Una opción sería usar la librería 'csv-writer' 
para generar CSVs estructurados.
```

## Áreas donde necesitamos ayuda

- 📱 Mejorar responsive design
- 🔐 Implementar autenticación
- 📊 Gráficos y estadísticas
- 🌍 Traducción a más idiomas
- 📈 Optimización de performance
- 🧪 Más tests

## Preguntas?

- Abre un issue con la etiqueta `question`
- Revisa documentación técnica en `TECHNICAL.md`
- Mira ejemplos en las ramas `example-*`

---

**¡Esperamos tus contribuciones!** 🚀
