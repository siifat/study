# Data Structures and Algorithms - Quick Reference

## Big O Notation

| Algorithm | Best Case | Average Case | Worst Case |
|-----------|-----------|--------------|------------|
| Binary Search | O(1) | O(log n) | O(log n) |
| Quick Sort | O(n log n) | O(n log n) | O(n²) |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) |
| Heap Sort | O(n log n) | O(n log n) | O(n log n) |

## Common Data Structures

### Array
- **Access**: O(1)
- **Search**: O(n)
- **Insertion**: O(n)
- **Deletion**: O(n)

### Linked List
- **Access**: O(n)
- **Search**: O(n)
- **Insertion**: O(1)
- **Deletion**: O(1)

### Hash Table
- **Access**: N/A
- **Search**: O(1)
- **Insertion**: O(1)
- **Deletion**: O(1)

### Binary Tree
- **Access**: O(log n)
- **Search**: O(log n)
- **Insertion**: O(log n)
- **Deletion**: O(log n)

## Sorting Algorithms

### Bubble Sort
```python
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr
```

### Quick Sort
```python
def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)
```

### Binary Search
```python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
```

## Graph Algorithms

### Depth-First Search (DFS)
```python
def dfs(graph, start, visited=None):
    if visited is None:
        visited = set()
    visited.add(start)
    for neighbor in graph[start]:
        if neighbor not in visited:
            dfs(graph, neighbor, visited)
    return visited
```

### Breadth-First Search (BFS)
```python
from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    visited.add(start)
    
    while queue:
        vertex = queue.popleft()
        for neighbor in graph[vertex]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return visited
```

---

**Course**: CSE 4304 - Data Structures & Algorithms  
**Semester**: Fall 2024  
**Last Updated**: December 2024
