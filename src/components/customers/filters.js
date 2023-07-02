import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Typography,
  Button,
  IconButton
} from '@material-ui/core';
import {MdOutlineClear} from 'react-icons/md';
const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
  },
  filterControl: {
    minWidth: 120,
    marginRight: theme.spacing(2),
  },
  slider: {
    marginTop: theme.spacing(2),
    width: 200,
  },
  menuPaper: {
  backgroundColor: '#fff',
  },
}));

const ProductFilter = ({brands, categories, pets, suppliers, products, setFilteredProducts }) => {
  const classes = useStyles();
  const [filter, setFilter] = useState({
    brand: '',
    price: '',
    category: '',
    pet: '',
    quantity: '',
    supplier: '',
  });
  const handleClearState = () => {
    setFilter({
      brand: '',
      price: '',
      category: '',
      pet: '',
      quantity: '',
      supplier: '',
    });
  };
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilter((prevFilter) => ({
      ...prevFilter,
      [name]: value,
    }));
  };

  const handlePriceSliderChange = (event, newValue) => {
    setFilter((prevFilter) => ({
      ...prevFilter,
      price: newValue,
    }));
  };

  useEffect(() => {
    applyFilters();
  }, [filter, products])
  
  const applyFilters = () => {
    let filteredProducts = products;

    if (filter.brand) {
      filteredProducts = filteredProducts.filter(
        (product) => product.brand === filter.brand
      );
    }
    if (filter.price) {
      filteredProducts = filteredProducts.filter((product) => {
        if (!isNaN(filter.price)) {
          return product.price > filter.price;
        }
        if (filter.price === '>20') {
          return product.price > 20;
        } else {
          const [minPrice, maxPrice] = filter.price.split('-');
          return product.price >= Number(minPrice) && product.price <= Number(maxPrice);
        }
      });
    }
    if (filter.category) {
      filteredProducts = filteredProducts.filter(
        (product) => product.category === filter.category
      );
    }
    if (filter.pet) {
      filteredProducts = filteredProducts.filter(
        (product) => product.pet === filter.pet
      );
    }
    if (filter.quantity) {
      filteredProducts = filteredProducts.filter(
        (product) => product.quantity >= filter.quantity
      );
    }
    if (filter.supplier) {
      filteredProducts = filteredProducts.filter(
        (product) => product.supplierName === filter.supplier
      );
    }

    setFilteredProducts(filteredProducts);
  };

  return (
    <div>
      <div className={classes.root}>
        <FormControl className={classes.filterControl}>
          <InputLabel>Brand</InputLabel>
          <Select
            name="brand"
            value={filter.brand}
            onChange={handleFilterChange}
            MenuProps={{
            classes: { paper: classes.menuPaper }, // Apply custom styles to the menu paper
          }}
          >
            <MenuItem value="">All Brands</MenuItem>
            
            {brands.map((brand) => (
              <MenuItem key={brand} value={brand}>
                {brand}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl className={classes.filterControl}>
          <InputLabel>Price</InputLabel>
          <Select
            name="price"
            value={filter.price}
            onChange={handleFilterChange}
            MenuProps={{
            classes: { paper: classes.menuPaper }, // Apply custom styles to the menu paper
          }}
          >
            <MenuItem value="">All Prices</MenuItem>
            <MenuItem value={filter.price}>{filter.price}</MenuItem>
            <MenuItem value="0-5">$0 - $5</MenuItem>
            <MenuItem value="5-10">$5 - $10</MenuItem>
            <MenuItem value="10-20">$10 - $20</MenuItem>
            <MenuItem value=">20">&gt;$20</MenuItem>
          </Select>
        </FormControl>
        <FormControl className={classes.filterControl}>
          <InputLabel>Category</InputLabel>
          <Select
            name="category"
            value={filter.category}
            onChange={handleFilterChange}
            MenuProps={{
            classes: { paper: classes.menuPaper }, // Apply custom styles to the menu paper
          }}
          >
            <MenuItem value="">All Categories</MenuItem>
            {/* Render category options dynamically */}
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl className={classes.filterControl}>
          <InputLabel>Pet</InputLabel>
          <Select
            name="pet"
            value={filter.pet}
            onChange={handleFilterChange}
            MenuProps={{
            classes: { paper: classes.menuPaper }, // Apply custom styles to the menu paper
          }}
          >
            <MenuItem value="">All Pets</MenuItem>
            {pets.map((pet) => (
              <MenuItem key={pet} value={pet}>
                {pet}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl className={classes.filterControl}>
          <InputLabel>Supplier</InputLabel>
          <Select
            name="supplier"
            value={filter.supplier}
            onChange={handleFilterChange}
            MenuProps={{
            classes: { paper: classes.menuPaper }, // Apply custom styles to the menu paper
          }}
          >
            <MenuItem value="">All Suppliers</MenuItem>
            {/* Render supplier options dynamically */}
            {suppliers.map((supplier) => (
              <MenuItem key={supplier} value={supplier}>
                {supplier}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      
      <div className={classes.slider}>
        <Typography id="price-slider" gutterBottom>
          Price Range
        </Typography>
        <Slider
          
          onChange={handlePriceSliderChange}
          valueLabelDisplay="auto"
          aria-labelledby="price-slider"
          step={5}
          marks
          min={0}
          max={50}
        />
      </div>
      <IconButton onClick={handleClearState}>
        <MdOutlineClear />
      </IconButton>
    </div>
    </div>
  );
};

export default ProductFilter;
