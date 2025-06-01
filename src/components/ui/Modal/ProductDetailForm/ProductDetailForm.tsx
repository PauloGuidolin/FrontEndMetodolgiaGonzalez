// src/components/ui/Modal/ProductDetailForm/ProductDetailForm.tsx
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { ProductoDetalleDTO } from "../../../dto/ProductoDetalleDTO";
import { Color } from "../../../../types/IColor";
import { Talle } from "../../../../types/ITalle";


interface ProductDetailFormProps {
  open: boolean;
  onClose: () => void;
  productDetail: ProductoDetalleDTO | null; // Null para agregar, objeto para editar
  productId: number; // Necesitamos el ID del producto al que pertenece este detalle
  onSubmit: (detailData: Partial<ProductoDetalleDTO>) => Promise<void>;
}

const ProductDetailForm: React.FC<ProductDetailFormProps> = ({
  open,
  onClose,
  productDetail,
  productId,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<Partial<ProductoDetalleDTO>>({
    precioCompra: 0,
    stockActual: 0,
    stockMaximo: 0,
    color: Color.NEGRO, // Valor por defecto
    talle: Talle.L, // Valor por defecto
  });

  useEffect(() => {
    if (productDetail) {
      // Modo edición: Pre-llenar el formulario
      setFormData({
        id: productDetail.id,
        precioCompra: productDetail.precioCompra || 0,
        stockActual: productDetail.stockActual || 0,
        stockMaximo: productDetail.stockMaximo || 0,
        color: productDetail.color || Color.NEGRO,
        talle: productDetail.talle || Talle.L,
        producto: productDetail.producto // Mantener la referencia al producto padre
      });
    } else {
      // Modo creación: Limpiar el formulario
      setFormData({
        precioCompra: 0,
        stockActual: 0,
        stockMaximo: 0,
        color: Color.NEGRO,
        talle: Talle.L,
        // Al crear, el producto padre se asignará en el onSubmit del padre
        producto: { id: productId } as any // Asegúrate de que ProductoDTO tenga un id
      });
    }
  }, [productDetail, open, productId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (event: any) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ ...formData, producto: { id: productId } as any }); // Asegurarse de enviar el ID del producto
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{productDetail ? "Editar Detalle de Producto" : "Agregar Detalle de Producto"}</DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit}>
          <TextField
            name="precioCompra"
            label="Precio de Compra"
            type="number"
            value={formData.precioCompra}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            inputProps={{ step: "0.01" }}
          />
          <TextField
            name="stockActual"
            label="Stock Actual"
            type="number"
            value={formData.stockActual}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            inputProps={{ min: "0" }}
          />
          <TextField
            name="stockMaximo"
            label="Stock Máximo"
            type="number"
            value={formData.stockMaximo}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            inputProps={{ min: "0" }}
          />

          {/* Selector de Color */}
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="color-select-label">Color</InputLabel>
            <Select
              labelId="color-select-label"
              id="color-select"
              name="color"
              value={formData.color || ''}
              onChange={handleSelectChange}
              label="Color"
            >
              {Object.values(Color).map((colorOption) => (
                <MenuItem key={colorOption} value={colorOption}>
                  {colorOption}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Selector de Talle */}
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="talle-select-label">Talle</InputLabel>
            <Select
              labelId="talle-select-label"
              id="talle-select"
              name="talle"
              value={formData.talle || ''}
              onChange={handleSelectChange}
              label="Talle"
            >
              {Object.values(Talle).map((talleOption) => (
                <MenuItem key={talleOption} value={talleOption}>
                  {talleOption.replace(/_/g, ' ')} {/* Para talles numéricos como "TALLE 41" */}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          {productDetail ? "Guardar Cambios" : "Agregar Detalle"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductDetailForm;