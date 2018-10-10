use std::collections::HashMap;
use std::hash::Hash;

#[derive(Clone, Copy)]
struct Vertex {
    parent: usize,
    rank: u8,
}

/// Union Find data structure, backed by 2 hash maps:
/// 1 map for mapping T to an internal representation
/// another map to store the structure of this data structure.
pub struct UnionFind<T>
where
    T: Copy + Clone + Eq + Hash,
{
    mapping: HashMap<T, usize>, // mapping
    vertices: Vec<Vertex>,      // structure
}

impl<T> UnionFind<T>
where
    T: Copy + Clone + Eq + Hash,
{
    /*
    pub fn new() -> Self {
        UnionFind {
            ids: Default::default(),
            vertices: Default::default(),
        }
    }
    */

    pub fn with_capacity(capacity: usize) -> Self {
        UnionFind {
            mapping: HashMap::with_capacity(capacity),
            vertices: Vec::with_capacity(capacity),
        }
    }

    /// Union 2 sets together. Return true iff both sets aren't the same set before the union.
    pub fn union(&mut self, left: T, right: T) -> bool {
        let Vertex {
            parent: left_root,
            rank: left_rank,
        } = self.add_if_not_found(left);
        let Vertex {
            parent: right_root,
            rank: right_rank,
        } = self.add_if_not_found(right);

        // already in the same set
        if left_root == right_root {
            return false;
        }

        if left_rank < right_rank {
            self.vertices[left_root] = Vertex {
                parent: right_root, // update the parent only
                rank: left_rank,
            };
        } else if left_rank > right_rank {
            self.vertices[right_root] = Vertex {
                parent: left_root, // update the parent only
                rank: right_rank,
            };
        } else {
            // make the left root as the child of right root
            self.vertices[left_root] = Vertex {
                parent: right_root,
                rank: right_rank + 1,
            };
        }
        return true;
    }

    /// Test whether the 2 sets are the same without adding new set to the data structure, unlike union().

    /*
    pub fn is_same_set(&mut self, left: T, right: T) -> bool {
        if let Some(&left_id) = self.ids.get(&left) {
            if let Some(&right_id) = self.ids.get(&right) {
                // same vertex
                if left_id == right_id {
                    return true;
                }
    
                let Vertex {
                    parent: left_parent,
                    ..
                } = self.find_inner(left_id);
                let Vertex {
                    parent: right_parent,
                    ..
                } = self.find_inner(right_id);
    
                return left_parent == right_parent;
            }
        }
        return false;
    }
    */

    fn add_if_not_found(&mut self, item: T) -> Vertex {
        match self.mapping.get(&item) {
            Some(&id) => self.find_inner(id),
            None => {
                let id = self.mapping.len();
                self.mapping.insert(item, id);
                let ret = Vertex {
                    parent: id,
                    rank: 0,
                };
                self.vertices.push(ret);
                ret
            }
        }
    }

    fn find_inner(&mut self, target_id: usize) -> Vertex {
        let mut path = vec![];
        let mut prev = target_id;
        loop {
            let &Vertex { parent, rank } = &self.vertices[prev];

            if prev == parent {
                // path compression
                let vertex = Vertex { parent, rank };
                for id in path {
                    self.vertices[id] = vertex;
                }
                return vertex;
            }

            // collect ancestors for future path compression
            path.push(prev);
            prev = parent;
        }
    }
}

#[cfg(test)]
mod tests {
    use super::UnionFind;

    #[test]
    fn basic() {
        let mut set = UnionFind::new();
        assert!(!set.is_same_set(1, 1));
        assert!(!set.is_same_set(2, 2));
        assert!(!set.is_same_set(1, 2));

        set.union(1, 1);
        set.union(2, 2);
        assert!(set.is_same_set(1, 1));
        assert!(set.is_same_set(2, 2));
        assert!(!set.is_same_set(1, 2));

        set.union(1, 2);
        assert!(set.is_same_set(1, 2));
    }

    #[test]
    fn bipartite() {
        let a = vec![1, 2, 3, 4];
        let b = vec![11, 22, 33, 44];
        let mut set = UnionFind::new();

        set.union(a[0], a[1]);
        set.union(a[1], a[2]);
        set.union(a[2], a[3]);

        set.union(b[0], b[1]);
        set.union(b[1], b[2]);
        set.union(b[2], b[3]);

        for i in 0..4 {
            for j in 0..4 {
                assert!(set.is_same_set(a[i], a[j]));
                assert!(set.is_same_set(b[i], b[j]));
                assert!(!set.is_same_set(a[i], b[j]));
            }
        }

        set.union(a[2], b[3]);
        for i in 0..4 {
            for j in 0..4 {
                assert!(set.is_same_set(a[i], a[j]));
                assert!(set.is_same_set(b[i], b[j]));
                assert!(set.is_same_set(a[i], b[j]));
            }
        }
    }
}
