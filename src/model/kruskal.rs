use ordered_float::OrderedFloat;
use std::collections::HashSet;
use std::fmt::Debug;
use std::hash::Hash;
use unionfind::UnionFind;
use SortedEdge;

pub fn mst<V, WeightFn>(
    vertices: &Vec<V>,
    edges: &HashSet<SortedEdge<usize>>,
    weight: WeightFn,
) -> HashSet<SortedEdge<usize>>
where
    V: Debug + Eq + Hash + Copy,
    WeightFn: Fn(&V, &V) -> f64,
{
    /*
    https://en.wikipedia.org/wiki/Kruskal%27s_algorithm
    KRUSKAL(G):
    1 A = ∅
    2 foreach v ∈ G.V:
    3    MAKE-SET(v)
    4 foreach (u, v) in G.E ordered by weight(u, v), increasing:
    5    if FIND-SET(u) ≠ FIND-SET(v):
    6       A = A ∪ {(u, v)}
    7       UNION(u, v)
    8 return A
    */

    let sorted_edges: Vec<_> = {
        let mut edges: Vec<_> = edges.into_iter().collect();
        edges.sort_unstable_by(|&SortedEdge(u1_idx, v1_idx), &SortedEdge(u2_idx, v2_idx)| {
            let u1 = vertices[*u1_idx];
            let v1 = vertices[*v1_idx];
            let u2 = vertices[*u2_idx];
            let v2 = vertices[*v2_idx];
            OrderedFloat(weight(&u1, &v1)).cmp(&OrderedFloat(weight(&u2, &v2)))
        });
        edges
    };

    let num_vertices = vertices.len();
    let mut mst_edges = HashSet::with_capacity(num_vertices);
    let mut sets = UnionFind::with_capacity(num_vertices);

    for &SortedEdge(u_idx, v_idx) in sorted_edges {
        if sets.union(u_idx, v_idx) {
            mst_edges.insert(SortedEdge::new(u_idx, v_idx));
        }
    }
    assert!(mst_edges.len() == 0 || mst_edges.len() == vertices.len() - 1);
    mst_edges
}

/*
/// O(V^2) for finding all parents for each vertex
pub fn mst_with_parents<V, NeighbourFn, WeightFn>(
    vertices: &Vec<V>,
    neighbours: NeighbourFn,
    weight: WeightFn,
) -> MinimumSpanningTree<V>
where
    V: Eq + Hash + Copy,
    NeighbourFn: Fn(V) -> Vec<V>,
    WeightFn: Fn(V, V) -> f64,
{
    let BasicMinimumSpanningTree {
        structure,
        mappings,
    } = mst(vertices, neighbours, weight);

    let num_vertices = structure.len();
    let mut all_parents = Vec::with_capacity(num_vertices);
    let mut visited = HashSet::with_capacity(num_vertices);
    let mut work_queue = VecDeque::with_capacity(num_vertices);

    for v_idx in 0..num_vertices {
        use std::usize::MAX;
        let mut parents = vec![MAX; num_vertices];

        assert!(work_queue.is_empty());

        work_queue.push_back((v_idx, None));
        visited.insert(v_idx);

        while !work_queue.is_empty() {
            let (cur, parent) = work_queue.pop_front().unwrap();
            if let Some(v_idx) = parent {
                assert!(parents[cur] == MAX);
                parents[cur] = v_idx;
            }

            for &neighbour in &structure[cur] {
                if visited.insert(neighbour) {
                    // neighbour not visited
                    work_queue.push_back((neighbour, Some(cur)));
                }
            }
        }

        visited.clear();

        all_parents.push(parents);
    }

    MinimumSpanningTree {
        structure,
        mappings,
        all_parents,
    }
}
*/
