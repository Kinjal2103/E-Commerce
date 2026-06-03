/**
 * QueryFeatures Utility Class
 * Simulates advanced query capabilities such as filtering (with operators like gte, lte, gt, lt)
 * and sorting (by single or multiple fields, ascending or descending).
 * 
 * Mimics Mongoose query builder chainable interface.
 */

class QueryFeatures {
  /**
   * @param {Array} query - The initial dataset array
   * @param {Object} queryString - The request query parameters (req.query)
   */
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  /**
   * Filters the dataset based on exact match query strings or numeric comparative operators.
   * e.g., /api/products?category=Electronics
   * e.g., /api/products?price[lte]=5000&price[gte]=1000
   * @returns {QueryFeatures} - returns self for method chaining
   */
  filter() {
    // Clone request query object
    const queryObj = { ...this.queryString };
    
    // Fields to exclude from initial exact filters
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Apply filtering logic to in-memory array
    this.query = this.query.filter(item => {
      for (const key in queryObj) {
        const val = queryObj[key];
        
        // Ensure property exists on target product object
        if (!(key in item)) return false;

        // If the query parameter value is an object (operator like { lte: '500' })
        if (typeof val === 'object' && val !== null) {
          const itemVal = Number(item[key]);
          for (const op in val) {
            const limit = Number(val[op]);
            if (op === 'gte' && !(itemVal >= limit)) return false;
            if (op === 'lte' && !(itemVal <= limit)) return false;
            if (op === 'gt' && !(itemVal > limit)) return false;
            if (op === 'lt' && !(itemVal < limit)) return false;
          }
        } else {
          // Exact match filter (handles string matches, numeric matches, and array inclusions)
          const itemVal = item[key];
          if (Array.isArray(itemVal)) {
            const hasMatch = itemVal.some((el) => {
              if (typeof el === 'object' && el !== null && el.name) {
                return String(el.name).toLowerCase() === String(val).toLowerCase();
              }
              return String(el).toLowerCase() === String(val).toLowerCase();
            });
            if (!hasMatch) return false;
          } else if (typeof itemVal === 'string' && typeof val === 'string') {
            if (itemVal.toLowerCase() !== val.toLowerCase()) return false;
          } else {
            if (itemVal != val) return false;
          }
        }
      }
      return true;
    });

    return this;
  }

  /**
   * Sorts the filtered array by one or more fields.
   * e.g., /api/products?sort=-price
   * e.g., /api/products?sort=category,price
   * @returns {QueryFeatures} - returns self for method chaining
   */
  sort() {
    if (this.queryString.sort) {
      // Split the comma separated sort string: ['category', '-price']
      const sortBy = this.queryString.sort.split(',');
      
      this.query = [...this.query].sort((a, b) => {
        for (const sortField of sortBy) {
          let field = sortField.trim();
          let isDescending = false;
          
          // Checks prefix to define order direction
          if (field.startsWith('-')) {
            isDescending = true;
            field = field.substring(1);
          }

          if (a[field] === undefined || b[field] === undefined) continue;

          let valA = a[field];
          let valB = b[field];

          // Numeric comparison
          if (typeof valA === 'number' && typeof valB === 'number') {
            if (valA !== valB) {
              return isDescending ? valB - valA : valA - valB;
            }
          } else {
            // String alphabetical comparison
            const strA = String(valA).toLowerCase();
            const strB = String(valB).toLowerCase();
            if (strA !== strB) {
              if (isDescending) {
                return strA < strB ? 1 : -1;
              } else {
                return strA > strB ? 1 : -1;
              }
            }
          }
        }
        return 0; // if fields are identical, falls through to next sort field or preserves order
      });
    } else {
      // Default fallback: Sort alphabetically by product name
      this.query = [...this.query].sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return this;
  }
}

module.exports = QueryFeatures;
