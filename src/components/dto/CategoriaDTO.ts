export interface CategoriaDTO {
    id: number;
    denominacion: string; // <--- Esta propiedad contiene el nombre de la categoría según tu JSON
    subcategorias: CategoriaDTO[]; // Representa las subcategorías anidadas
    // Añade aquí otras propiedades de Categoria si las necesitas en el frontend y están en el DTO del backend
}