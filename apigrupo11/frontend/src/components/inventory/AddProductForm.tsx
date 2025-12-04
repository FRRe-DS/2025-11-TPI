import React, { useEffect, useState } from 'react';
import { theme } from '../../styles/theme';
import { Button } from '../ui/Button';
import type { ICategoria, IProducto, IProductoInput, IProductoUpdate } from '../../types/api.types';

interface FormState {
  nombre: string;
  descripcion: string;
  precio: string;
  stockInicial: string;
  pesoKg: string;
  dimensiones: {
    largoCm: string;
    anchoCm: string;
    altoCm: string;
  };
  ubicacion: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  categoriaId: number | '';
}

const EMPTY_FORM: FormState = {
  nombre: '',
  descripcion: '',
  precio: '',
  stockInicial: '',
  pesoKg: '',
  dimensiones: {
    largoCm: '',
    anchoCm: '',
    altoCm: '',
  },
  ubicacion: {
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'AR',
  },
  categoriaId: '',
};

const styles: { [key: string]: React.CSSProperties } = {
  panel: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    width: '100%',
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
  formSubGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: theme.spacing.md,
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
    fontWeight: 600,
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
  fieldSet: {
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  legend: {
    fontSize: theme.fontSizes.caption,
    fontWeight: 600,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    padding: '0 4px',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  alert: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    border: `1px solid ${theme.colors.danger}`,
    color: theme.colors.danger,
  },
  success: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    border: '1px solid #16a34a',
    color: '#22c55e',
  },
};

const buildStateFromProduct = (product: IProducto): FormState => ({
  nombre: product.nombre ?? '',
  descripcion: product.descripcion ?? '',
  precio: product.precio ? String(product.precio) : '',
  stockInicial: product.stockDisponible ? String(product.stockDisponible) : '',
  pesoKg: product.pesoKg ? String(product.pesoKg) : '',
  dimensiones: {
    largoCm: product.dimensiones?.largo ? String(product.dimensiones.largo) : '',
    anchoCm: product.dimensiones?.ancho ? String(product.dimensiones.ancho) : '',
    altoCm: product.dimensiones?.alto ? String(product.dimensiones.alto) : '',
  },
  ubicacion: {
    street: product.ubicacion?.street ?? '',
    city: product.ubicacion?.city ?? '',
    state: product.ubicacion?.state ?? '',
    postal_code: product.ubicacion?.postal_code ?? '',
    country: product.ubicacion?.country ?? 'AR',
  },
  categoriaId: product.categorias && product.categorias.length > 0 ? product.categorias[0].id : '',
});

const hasDimensionData = (dim: FormState['dimensiones']) =>
  dim.largoCm !== '' || dim.anchoCm !== '' || dim.altoCm !== '';

const hasLocationData = (loc: FormState['ubicacion']) =>
  loc.street !== '' || loc.city !== '' || loc.state !== '' || loc.postal_code !== '' || loc.country !== '';

interface AddProductFormProps {
  onClose: () => void;
  onAdd?: (product: IProducto) => void;
  onUpdate?: (product: IProducto) => void;
  token?: string;
  categories?: ICategoria[];
  mode?: 'create' | 'edit';
  product?: IProducto | null;
}

export const AddProductForm: React.FC<AddProductFormProps> = ({
  onClose,
  onAdd,
  onUpdate,
  token,
  categories = [],
  mode = 'create',
  product = null,
}) => {
  const [formData, setFormData] = useState<FormState>(() =>
    mode === 'edit' && product ? buildStateFromProduct(product) : { ...EMPTY_FORM }
  );
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [localCategories, setLocalCategories] = useState<ICategoria[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    if (mode === 'edit' && product) {
      setFormData(buildStateFromProduct(product));
    }
    if (mode === 'create' && product === null) {
      setFormData({ ...EMPTY_FORM });
    }
  }, [mode, product]);

  useEffect(() => {
  const fetchCategorias = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
      const res = await fetch(`${baseUrl}/api/categorias`);
      const data = await res.json();
      setLocalCategories(data);
    } catch (err) {
      console.error('Error cargando categorías:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Si el componente NO recibe categorías desde props, las trae él solo
  if (!categories || categories.length === 0) {
    fetchCategorias();
  } else {
    setLocalCategories(categories);
    setLoadingCategories(false);
  }
}, [categories]);


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: e.target instanceof HTMLSelectElement ? Number(value) || '' : value,
    }));
  };

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

  const parseNumber = (value: string, decimals = 2): number | undefined => {
    if (value === '') return undefined;
    const parsed = decimals === 0 ? parseInt(value, 10) : parseFloat(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const buildInputPayload = (): { create?: IProductoInput; update?: IProductoUpdate } => {
    const precio = parseNumber(formData.precio);
    const stockInicial = parseNumber(formData.stockInicial, 0);
    const pesoKg = parseNumber(formData.pesoKg);

    if (precio === undefined || stockInicial === undefined) {
      throw new Error('Completa precio y stock con valores numéricos válidos.');
    }

    const dimensiones = hasDimensionData(formData.dimensiones)
      ? {
          largoCm: parseNumber(formData.dimensiones.largoCm) ?? 0,
          anchoCm: parseNumber(formData.dimensiones.anchoCm) ?? 0,
          altoCm: parseNumber(formData.dimensiones.altoCm) ?? 0,
        }
      : undefined;

    const ubicacion = hasLocationData(formData.ubicacion)
      ? {
          street: formData.ubicacion.street,
          city: formData.ubicacion.city,
          state: formData.ubicacion.state,
          postal_code: formData.ubicacion.postal_code,
          country: formData.ubicacion.country || 'AR',
        }
      : undefined;

    const categoriaIds = formData.categoriaId ? [Number(formData.categoriaId)] : undefined;

    if (mode === 'create') {
      const payload: IProductoInput = {
        nombre: formData.nombre,
        descripcion: formData.descripcion || undefined,
        precio,
        stockInicial,
        pesoKg,
        dimensiones,
        ubicacion,
        categoriaIds,
      };
      return { create: payload };
    }

    const payload: IProductoUpdate = {
      nombre: formData.nombre || undefined,
      descripcion: formData.descripcion || undefined,
      precio,
      stockInicial,
      pesoKg,
      dimensiones: dimensiones ?? null,
      ubicacion: ubicacion ?? null,
      categoriaIds,
    };

    return { update: payload };
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!formData.categoriaId) {
      setErrorMsg('Selecciona una categoría para el producto.');
      return;
    }

    try {
      const payload = buildInputPayload();
      setSubmitting(true);

      // Construir URL base
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 
        (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

      console.log('[AddProductForm] Iniciando submit:', { mode, baseUrl, hasToken: !!token });
      console.log('[AddProductForm] Payload:', JSON.stringify(payload, null, 2));

      if (mode === 'edit' && product) {
        // Editar producto existente
        const url = `${baseUrl}/api/productos/${product.id}`;
        console.log('[AddProductForm] PATCH a:', url);

        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(url, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(payload.update),
        });

        console.log('[AddProductForm] Respuesta PATCH:', res.status, res.statusText);

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Error ${res.status}: ${errorText}`);
        }

        const updatedData = await res.json();
        console.log('[AddProductForm] Producto actualizado:', updatedData);
        
        // Obtener producto completo
        const getRes = await fetch(`${baseUrl}/api/productos/${product.id}`, { headers });
        const fullProduct = getRes.ok ? await getRes.json() : updatedData;
        
        onUpdate?.(fullProduct);
        setSuccessMsg('Producto actualizado correctamente.');
      } else {
        // Crear nuevo producto
        const url = `${baseUrl}/api/productos`;
        console.log('[AddProductForm] POST a:', url);

        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload.create),
        });

        console.log('[AddProductForm] Respuesta POST:', res.status, res.statusText);

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Error ${res.status}: ${errorText}`);
        }

        const createResp = await res.json();
        console.log('[AddProductForm] Respuesta crear:', createResp);

        // Intentar obtener el producto completo
        let createdProduct = createResp;
        if (createResp?.id) {
          try {
            const getRes = await fetch(`${baseUrl}/api/productos/${createResp.id}`, { headers });
            if (getRes.ok) {
              createdProduct = await getRes.json();
              console.log('[AddProductForm] Producto completo:', createdProduct);
            }
          } catch (err) {
            console.warn('[AddProductForm] No se pudo obtener producto completo:', err);
          }
        }

        onAdd?.(createdProduct);
        setSuccessMsg('Producto agregado correctamente.');
      }

      setTimeout(() => {
        setSubmitting(false);
        onClose();
      }, 900);
    } catch (err: any) {
      console.error('[AddProductForm] Error:', err);
      setSubmitting(false);
      const message = err?.message || 'Error al guardar el producto.';
      setErrorMsg(message);
    }
  };

  const submitLabel = mode === 'edit' ? 'Guardar cambios' : 'Agregar producto';

  return (
    <div style={styles.panel}>
      <form style={styles.form} onSubmit={onSubmit}>
        {errorMsg && <div style={styles.alert}>{errorMsg}</div>}
        {successMsg && <div style={styles.success}>{successMsg}</div>}

        <div style={styles.formGrid}>
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="nombre">
              Nombre del producto
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

          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="stockInicial">
              Stock inicial
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
              Peso (kg)
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

          <div style={{ ...styles.fieldGroup, ...styles.fullWidth }}>
            <label style={styles.label} htmlFor="categoriaId">
              Categoría
            </label>
            <select
              id="categoriaId"
              name="categoriaId"
              style={styles.input}
              value={formData.categoriaId === '' ? '' : String(formData.categoriaId)}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                Selecciona una categoría
              </option>
              {loadingCategories ? (
                <option value="">Cargando categorías...</option>
              ) : (
                localCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))
              )}

            </select>
          </div>

          <div style={{ ...styles.fieldGroup, ...styles.fullWidth }}>
            <fieldset style={styles.fieldSet}>
              <legend style={styles.legend}>Dimensiones (cm)</legend>
              <div style={styles.formSubGrid}>
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
                    step="0.01"
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
                    step="0.01"
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
                    step="0.01"
                  />
                </div>
              </div>
            </fieldset>
          </div>

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

          <div style={{ ...styles.fieldGroup, ...styles.fullWidth }}>
            <fieldset style={styles.fieldSet}>
              <legend style={styles.legend}>Ubicación en almacén</legend>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: theme.spacing.md }}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label} htmlFor="street">
                    Dirección
                  </label>
                  <input
                    style={styles.input}
                    type="text"
                    id="street"
                    name="street"
                    value={formData.ubicacion.street}
                    onChange={(e) => handleNestedChange('ubicacion', e)}
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
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label} htmlFor="state">
                    Provincia / Estado
                  </label>
                  <input
                    style={styles.input}
                    type="text"
                    id="state"
                    name="state"
                    value={formData.ubicacion.state}
                    onChange={(e) => handleNestedChange('ubicacion', e)}
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label} htmlFor="postal_code">
                    Código postal
                  </label>
                  <input
                    style={styles.input}
                    type="text"
                    id="postal_code"
                    name="postal_code"
                    value={formData.ubicacion.postal_code}
                    onChange={(e) => handleNestedChange('ubicacion', e)}
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label} htmlFor="country">
                    País
                  </label>
                  <input
                    style={styles.input}
                    type="text"
                    id="country"
                    name="country"
                    value={formData.ubicacion.country}
                    onChange={(e) => handleNestedChange('ubicacion', e)}
                  />
                </div>
              </div>
            </fieldset>
          </div>
        </div>

        <div style={styles.buttonContainer}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Guardando…' : submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
};
