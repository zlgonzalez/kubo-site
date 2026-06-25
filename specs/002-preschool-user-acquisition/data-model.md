# Data Model Design: Local SEO and AI Search Optimization

## 1. Campus Location
Represents a physical school site.

| Field Name | Type | Description |
|---|---|---|
| `name` | String | Brand name of the campus (e.g., "Roots N' Wings Montessori") |
| `streetAddress` | String | Street address (e.g., "2823 Flores St") |
| `locality` | String | City (e.g., "San Mateo") |
| `region` | String | State (e.g., "CA") |
| `postalCode` | String | Zip code (e.g., "94403") |
| `latitude` | Float | GPS latitude coordinates |
| `longitude` | Float | GPS longitude coordinates |
| `licenseNumber` | String | State child care license number |
| `hours` | String | Operational hours (e.g., "9:00 AM to 5:30 PM") |
| `typicalAgeRange` | String | Ages served (e.g., "20 months to 6 years") |
| `pottyTrainingSupport` | Boolean | Whether potty training assistance is provided |
| `mealsIncluded` | Boolean | Whether hot lunches/snacks are included |
| `studentTeacherRatio` | String | Student-to-teacher ratio (e.g., "6:1") |

### Schema.org Integration
The Campus Location data maps directly to standard JSON-LD schemas:
- **Redwood City**: `Preschool` type.
- **San Mateo**: `DayCare` type.

---

## 2. Teacher Profile
Represents a credentialed guide working at a specific campus.

| Field Name | Type | Description |
|---|---|---|
| `name` | String | Name of the teacher |
| `bio` | String | Professional biography and qualifications |
| `imagePath` | String | Path to teacher photo (optimized WebP format) |
| `credentialType` | String | Montessori credential type (e.g., "AMS", "AMI") |
