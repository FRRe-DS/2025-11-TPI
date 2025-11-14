import React, { useState } from 'react';
import { theme } from '../../styles/theme';
import { Button } from '../ui/Button';
// NOTA: ImageDropzone se eliminó porque la API espera una URL, no un archivo.

// Estilos (se añadió 'formSubGrid' para campos anidados)
const styles: { [key: string]: React.CSSProperties } = {
  panel: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    width: '100%',
  },
  buttonContainer: {
    display: 'flex',
    gap: theme.spacing.md,
    marginTop: 'auto',
    paddingTop: theme.spacing.lg,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: `${theme.spacing.lg} ${theme.spacing.md}`,
  },
  // Rejilla para campos anidados como dimensiones y ubicación
  formSubGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: `${theme.spacing.md}`,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.sm,
  },
  fullWidth: {
    gridColumn: '1 / -1',
  },
  label: {
    fontSize: theme.fontSizes.caption,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: theme.borderRadius.sm,
    border: `1px solid ${theme.colors.border}`,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.body,
    backgroundColor: theme.colors.surface,
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    borderRadius: theme.borderRadius.sm,
    border: `1px solid ${theme.colors.border}`,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.body,
    backgroundColor: theme.colors.surface,
    boxSizing: 'border-box',
    minHeight: '100px',
    resize: 'vertical',
  },
  // Estilo para un grupo de campos (ej. Dimensiones)
  fieldSet: {
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  legend: {
    fontSize: theme.fontSizes.caption,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    padding: '0 4px',
  },
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingTop: '8px',
  },
};

// Estado inicial basado en el schema 'ProductoInput'
const initialFormState = {
  nombre: '',
  descripcion: '',
  precio: 0,
  stockInicial: 0,
  pesoKg: 0,
  // Objeto anidado para dimensiones
  dimensiones: {
    largoCm: 0,
    anchoCm: 0,
    altoCm: 0,
  },
  // Objeto anidado para ubicacion
  ubicacion: {
    street: '',
    city: 'Resistencia', // Valor por defecto
    state: 'Chaco', // Valor por defecto
    postal_code: '',
    country: 'AR', // Valor por defecto
  },
  // Array de imágenes (empezamos con una)
  imagenes: [{ url: '', esPrincipal: true }],
  // Campo de texto para IDs de categoría
  categoriaIds: '',
};

interface AddProductFormProps {
  onClose: () => void;
  onAdd?: (product: any) => void;
}

export const AddProductForm: React.FC<AddProductFormProps> = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState(initialFormState);

  // Handler para campos de texto/número simples
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handler para campos anidados (dimensiones, ubicacion)
  const handleNestedChange = (
    group: 'dimensiones' | 'ubicacion',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [name]: value,
      },
    }));
  };

  // Handler para el array de imágenes (simplificado para una sola imagen)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      imagenes: [
        {
          ...prev.imagenes[0],
          [name]: type === 'checkbox' ? checked : value,
        },
      ],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Transformar el estado del formulario al formato que la API espera
    const payload = {
      ...formData,
      // Convertir strings a números
      precio: parseFloat(String(formData.precio)) || 0,
      stockInicial: parseInt(String(formData.stockInicial)) || 0,
      pesoKg: parseFloat(String(formData.pesoKg)) || 0,
      // Convertir strings de dimensiones a números
      dimensiones: {
        largoCm: parseFloat(String(formData.dimensiones.largoCm)) || 0,
        anchoCm: parseFloat(String(formData.dimensiones.anchoCm)) || 0,
        altoCm: parseFloat(String(formData.dimensiones.altoCm)) || 0,
      },
      // Convertir string de IDs a array de números
      categoriaIds: formData.categoriaIds
        .split(',')
        .map((id) => parseInt(id.trim()))
        .filter((id) => !isNaN(id) && id > 0),
      // Asegurarse de que el objeto ubicación esté completo
      ubicacion: {
        ...formData.ubicacion,
      },
      // Filtrar imágenes sin URL
      imagenes: formData.imagenes.filter((img) => img.url),
    };

    console.log('Formulario a enviar (Payload):', payload);
    // Creamos un producto temporal en frontend (sin backend)
    const newProduct = {
      id: Date.now(),
      nombre: payload.nombre,
      descripcion: payload.descripcion,
      precio: payload.precio,
      stockDisponible: payload.stockInicial,
      stockReservado: 0,
      stockTotal: payload.stockInicial,
      vendedorId: 0,
      categoriaId: payload.categoriaIds.length > 0 ? payload.categoriaIds[0] : 0,
      categoria: '',
      pesoKg: payload.pesoKg,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
      imagenes: payload.imagenes,
      dimensiones: {
        largo: payload.dimensiones.largoCm,
        ancho: payload.dimensiones.anchoCm,
        alto: payload.dimensiones.altoCm,
      },
      ubicacion: {
        almacen: payload.ubicacion.street || `${payload.ubicacion.city}`,
      },
    };

    if (onAdd) onAdd(newProduct);
    onClose();
  };

  return (
    <div style={styles.panel}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={styles.formGrid}>
          {/* --- Fila 1: Nombre y Precio --- */}
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="nombre">
              Nombre del Producto
            </label>
            <input
              style={styles.input}
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="precio">
              Precio
            </label>
            <input
              style={styles.input}
              type="number"
              id="precio"
              name="precio"
              value={formData.precio}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* --- Fila 2: Stock Inicial y Peso --- */}
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="stockInicial">
              Stock Inicial
            </label>
            <input
              style={styles.input}
              type="number"
              id="stockInicial"
              name="stockInicial"
              value={formData.stockInicial}
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="pesoKg">
              Peso (Kg)
            </label>
            <input
              style={styles.input}
              type="number"
              id="pesoKg"
              name="pesoKg"
              value={formData.pesoKg}
              onChange={handleChange}
              min="0"
              step="0.01"
            />
          </div>

          {/* --- Fila 3: Categorías (Full Width) --- */}
          <div style={{ ...styles.fieldGroup, ...styles.fullWidth }}>
            <label style={styles.label} htmlFor="categoriaIds">
              IDs de Categoría
            </label>
            <input
              style={styles.input}
              type="text"
              id="categoriaIds"
              name="categoriaIds"
              value={formData.categoriaIds}
              onChange={handleChange}
              placeholder="Ej: 1, 5, 22 (separados por coma)"
            />
          </div>

          {/* --- Fila 4: Dimensiones (Full Width) --- */}
          <div style={{ ...styles.fieldGroup, ...styles.fullWidth }}>
            <fieldset style={styles.fieldSet}>
              <legend style={styles.legend}>Dimensiones (cm)</legend>
              <div
                style={{
                  ...styles.formSubGrid,
                  gridTemplateColumns: '1fr 1fr 1fr',
                }}
              >
                <div style={styles.fieldGroup}>
                  <label style={styles.label} htmlFor="largoCm">
                    Largo
                  </label>
                  <input
                    style={styles.input}
                    type="number"
                    id="largoCm"
                    name="largoCm"
                    value={formData.dimensiones.largoCm}
                    onChange={(e) => handleNestedChange('dimensiones', e)}
                    min="0"
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label} htmlFor="anchoCm">
                    Ancho
                  </label>
                  <input
                    style={styles.input}
                    type="number"
                    id="anchoCm"
                    name="anchoCm"
                    value={formData.dimensiones.anchoCm}
                    onChange={(e) => handleNestedChange('dimensiones', e)}
                    min="0"
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label} htmlFor="altoCm">
                    Alto
                  </label>
                  <input
                    style={styles.input}
                    type="number"
                    id="altoCm"
                    name="altoCm"
                    value={formData.dimensiones.altoCm}
                    onChange={(e) => handleNestedChange('dimensiones', e)}
                    min="0"
                  />
                </div>
              </div>
            </fieldset>
          </div>

          {/* --- Fila 5: Descripción (Full Width) --- */}
          <div style={{ ...styles.fieldGroup, ...styles.fullWidth }}>
            <label style={styles.label} htmlFor="descripcion">
              Descripción
            </label>
            <textarea
              style={styles.textarea}
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              maxLength={500}
            />
          </div>

          {/* --- Fila 6: Ubicación (Full Width) --- */}
          <div style={{ ...styles.fieldGroup, ...styles.fullWidth }}>
            <fieldset style={styles.fieldSet}>
              <legend style={styles.legend}>Ubicación en Almacén</legend>
              <div style={styles.formSubGrid}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label} htmlFor="street">
                    Calle
                  </label>
                  <input
                    style={styles.input}
                    type="text"
                    id="street"
                    name="street"
                    value={formData.ubicacion.street}
                    onChange={(e) => handleNestedChange('ubicacion', e)}
                    required
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label} htmlFor="city">
                    Ciudad
                  </label>
                  <input
                    style={styles.input}
                    type="text"
                    id="city"
                    name="city"
                    value={formData.ubicacion.city}
                    onChange={(e) => handleNestedChange('ubicacion', e)}
                    required
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label} htmlFor="state">
                    Provincia
                  </label>
                  <input
                    style={styles.input}
                    type="text"
                    id="state"
                    name="state"
                    value={formData.ubicacion.state}
                    onChange={(e) => handleNestedChange('ubicacion', e)}
                    required
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label} htmlFor="postal_code">
                    Cód. Postal
                  </label>
                  <input
                    style={styles.input}
                    type="text"
                    id="postal_code"
                    name="postal_code"
                    value={formData.ubicacion.postal_code}
                    onChange={(e) => handleNestedChange('ubicacion', e)}
                    required
                  />
                </div>
                <div style={{ ...styles.fieldGroup, ...styles.fullWidth }}>
                  <label style={styles.label} htmlFor="country">
                    País (Cód. ISO)
                  </label>
                  <input
                    style={styles.input}
                    type="text"
                    id="country"
                    name="country"
                    value={formData.ubicacion.country}
                    onChange={(e) => handleNestedChange('ubicacion', e)}
                    required
                    maxLength={2}
                  />
                </div>
              </div>
            </fieldset>
          </div>

          {/* --- Fila 7: Imagen (Full Width) --- */}
          <div style={{ ...styles.fieldGroup, ...styles.fullWidth }}>
            <fieldset style={styles.fieldSet}>
              <legend style={styles.legend}>Imagen Principal</legend>
              <div style={styles.fieldGroup}>
                <label style={styles.label} htmlFor="url">
                  URL de la Imagen
                </label>
                <input
                  style={styles.input}
                  type="url"
                  id="url"
                  name="url"
                  value={formData.imagenes[0].url}
                  onChange={handleImageChange}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
              <div style={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  id="esPrincipal"
                  name="esPrincipal"
                  checked={formData.imagenes[0].esPrincipal}
                  onChange={handleImageChange}
                />
                <label
                  htmlFor="esPrincipal"
                  style={{ ...styles.label, textTransform: 'none' }}
                >
                  Es imagen principal
                </label>
              </div>
            </fieldset>
          </div>
        </div>

        {/* --- Botones (sin cambios) --- */}
        <div style={styles.buttonContainer}>
          <Button
            type="button"
            variant="secondary"
            style={{ flex: 1 }}
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" style={{ flex: 1 }}>
            Guardar Producto
          </Button>
        </div>
      </form>
    </div>
  );
};
