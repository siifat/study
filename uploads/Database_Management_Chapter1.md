# Database Management Systems - Chapter 1

## Introduction to Databases

A **database** is an organized collection of structured information, or data, typically stored electronically in a computer system.

### Key Concepts

1. **Data**: Raw facts and figures
2. **Information**: Processed data that has meaning
3. **Database**: Collection of related data
4. **DBMS**: Software that manages databases

### Types of Databases

- **Relational Databases** (SQL)
  - MySQL
  - PostgreSQL
  - Oracle
  - SQL Server

- **NoSQL Databases**
  - MongoDB (Document)
  - Redis (Key-Value)
  - Cassandra (Column-family)
  - Neo4j (Graph)

### Database Design Principles

1. **Normalization**: Eliminate redundancy
2. **Integrity**: Maintain data accuracy
3. **Security**: Protect sensitive data
4. **Performance**: Optimize query execution

### SQL Basics

```sql
-- Create a table
CREATE TABLE students (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    age INT
);

-- Insert data
INSERT INTO students (id, name, email, age) 
VALUES (1, 'John Doe', 'john@email.com', 20);

-- Query data
SELECT * FROM students WHERE age > 18;
```

### Best Practices

- Use proper naming conventions
- Implement backup strategies
- Monitor performance regularly
- Maintain data consistency
- Follow ACID properties

---

**Note**: This is a study material for CSE 4308 - Database Management Systems
**Semester**: Fall 2024
**Professor**: Dr. Smith
