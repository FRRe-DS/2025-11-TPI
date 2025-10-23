import React from 'react';
import { theme } from '../../styles/theme';

const styles: { [key: string]: React.CSSProperties } = {
  tableContainer: {
    overflowX: 'auto',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: theme.fonts.family,
  },
  th: {
    backgroundColor: theme.colors.background,
    color: theme.colors.textSecondary,
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: theme.fontSizes.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    borderBottom: `1px solid ${theme.colors.border}`,
  },
  td: {
    padding: '12px 16px',
    borderBottom: `1px solid ${theme.colors.border}`,
    color: theme.colors.textPrimary,
    fontSize: theme.fontSizes.body,
  },
  tr: {
    transition: 'background-color 0.2s',
  },
};

// Este componente es genérico y puede aceptar cualquier tipo de datos.
interface TableProps<T> {
  headers: { key: keyof T; label: string }[];
  data: T[];
}

export const Table = <T extends { id: number | string }>({
  headers,
  data,
}: TableProps<T>) => {
  return (
    <div style={styles.tableContainer}>
      <table style={styles.table}>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={String(header.key)} style={styles.th}>
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} style={styles.tr}>
              {headers.map((header) => (
                <td key={String(header.key)} style={styles.td}>
                  {String(row[header.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
