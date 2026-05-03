export interface TestCase {
  input: string;
  expectedOutput: string;
  explanation?: string;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  statement: string;
  constraints: string[];
  testCases: TestCase[];
  hiddenTestCases?: TestCase[];
  defaultCode: Record<string, string>;
}

export const CODING_TOPICS = [
  "Sorting", "Greedy", "Depth-First Search", "Binary Search", "Database",
  "Bit Manipulation", "Matrix", "Tree", "Breadth-First Search", "Two Pointers",
  "Prefix Sum", "Heap", "Simulation", "Counting", "Graph Theory",
  "Binary Tree", "Stack", "Sliding Window", "Recursion", "Linked List"
];

export const CODING_PROBLEMS: Problem[] = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    topic: "Arrays",
    statement: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9"
    ],
    testCases: [
      { 
        input: "nums = [2, 7, 11, 15], target = 9", 
        expectedOutput: "[0, 1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      { 
        input: "nums = [3, 2, 4], target = 6", 
        expectedOutput: "[1, 2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
      },
      { 
        input: "nums = [3, 3], target = 6", 
        expectedOutput: "[0, 1]",
        explanation: "The numbers at index 0 and 1 add up to 6."
      }
    ],
    hiddenTestCases: [
      { input: "[2, 5, 5, 11], 10", expectedOutput: "[1, 2]" },
      { input: "[0, 4, 3, 0], 0", expectedOutput: "[0, 3]" },
      { input: "[-1, -2, -3, -4, -5], -8", expectedOutput: "[2, 4]" }
    ],
    defaultCode: {
      python: "def solve(nums, target):\n    # Write your code here\n    pass",
      javascript: "function solve(nums, target) {\n    // Write your code here\n}",
      java: "public class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[]{};\n    }\n}",
      cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n    }\n};"
    }
  },
  {
    id: "bubble-sort",
    title: "Bubble Sort Implementation",
    difficulty: "Easy",
    topic: "Sorting",
    statement: "Implement the Bubble Sort algorithm to sort an array of integers in ascending order.",
    constraints: [
      "1 <= nums.length <= 1000",
      "-10^5 <= nums[i] <= 10^5"
    ],
    testCases: [
      { 
        input: "[64, 34, 25, 12, 22, 11, 90]", 
        expectedOutput: "[11, 12, 22, 25, 34, 64, 90]",
        explanation: "The input array is completely unsorted."
      },
      { 
        input: "[5, 1, 4, 2, 8]", 
        expectedOutput: "[1, 2, 4, 5, 8]",
        explanation: "Simple sorting of 5 elements."
      }
    ],
    hiddenTestCases: [
      { input: "[1]", expectedOutput: "[1]" },
      { input: "[2, 1]", expectedOutput: "[1, 2]" },
      { input: "[0, 0, 0]", expectedOutput: "[0, 0, 0]" }
    ],
    defaultCode: {
      python: "def solve(nums):\n    # Write your code here\n    pass",
      javascript: "function solve(nums) {\n    // Write your code here\n}",
      java: "public class Solution {\n    public int[] bubbleSort(int[] nums) {\n        // Write your code here\n        return nums;\n    }\n}",
      cpp: "class Solution {\npublic:\n    vector<int> sortArray(vector<int>& nums) {\n        // Write your code here\n    }\n};"
    }
  },
  {
    id: "max-subarray",
    title: "Maximum Subarray",
    difficulty: "Medium",
    topic: "Greedy",
    statement: "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
    constraints: [
      "1 <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4"
    ],
    testCases: [
      { input: "[-2, 1, -3, 4, -1, 2, 1, -5, 4]", expectedOutput: "6" }
    ],
    defaultCode: {
      python: "def solve(nums):\n    # Use Kadane's algorithm\n    pass",
      javascript: "function solve(nums) {\n    // Use Kadane's algorithm\n}",
      java: "public class Solution {\n    public int maxSubArray(int[] nums) {\n        // Write your code here\n    }\n}",
      cpp: "class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        // Write your code here\n    }\n};"
    }
  },
  {
    id: "reverse-string",
    title: "Reverse String",
    difficulty: "Easy",
    topic: "Two Pointers",
    statement: "Write a function that reverses a string. The input string is given as an array of characters `s`.",
    constraints: ["1 <= s.length <= 10^5", "s[i] is a printable ascii character."],
    testCases: [{ input: "['h','e','l','l','o']", expectedOutput: "['o','l','l','e','h']" }],
    defaultCode: { python: "def solve(s):\n    s.reverse()", javascript: "function solve(s) {\n    return s.reverse();\n}", java: "public void reverseString(char[] s) {\n    // Solve in-place\n}", cpp: "void reverseString(vector<char>& s) {}" }
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    topic: "Stack",
    statement: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only."],
    testCases: [{ input: "'()[]{}'", expectedOutput: "true" }, { input: "'(]'", expectedOutput: "false" }],
    defaultCode: { python: "def solve(s):\n    pass", javascript: "function solve(s) {\n    \n}", java: "public boolean isValid(String s) {\n    return false;\n}", cpp: "bool isValid(string s) {}" }
  },
  {
    id: "merge-sorted-lists",
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    topic: "Linked List",
    statement: "Merge two sorted linked lists and return it as a sorted list. The list should be made by splicing together the nodes of the first two lists.",
    constraints: ["Number of nodes in both lists is in range [0, 50].", "-100 <= Node.val <= 100"],
    testCases: [{ input: "[1,2,4], [1,3,4]", expectedOutput: "[1,1,2,3,4,4]" }],
    defaultCode: { python: "def solve(l1, l2):\n    pass", javascript: "function solve(l1, l2) {\n    \n}", java: "public ListNode mergeTwoLists(ListNode l1, ListNode l2) {\n    return null;\n}", cpp: "ListNode* mergeTwoLists(ListNode* l1, ListNode* l2) {}" }
  },
  {
    id: "best-time-stock",
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    topic: "Dynamic Programming",
    statement: "You are given an array `prices` where `prices[i]` is the price of a given stock on the `i`-th day. Return the maximum profit you can achieve.",
    constraints: ["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"],
    testCases: [{ input: "[7,1,5,3,6,4]", expectedOutput: "5" }],
    defaultCode: { python: "def solve(prices):\n    pass", javascript: "function solve(prices) {\n    \n}", java: "public int maxProfit(int[] prices) {\n    return 0;\n}", cpp: "int maxProfit(vector<int>& prices) {}" }
  },
  {
    id: "binary-search",
    title: "Binary Search",
    difficulty: "Easy",
    topic: "Binary Search",
    statement: "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index.",
    constraints: ["1 <= nums.length <= 10^4", "-10^4 < nums[i], target < 10^4"],
    testCases: [{ input: "[-1,0,3,5,9,12], 9", expectedOutput: "4" }],
    defaultCode: { python: "def solve(nums, target):\n    pass", javascript: "function solve(nums, target) {\n    \n}", java: "public int search(int[] nums, int target) {\n    return -1;\n}", cpp: "int search(vector<int>& nums, int target) {}" }
  },
  {
    id: "climbing-stairs",
    title: "Climbing Stairs",
    difficulty: "Easy",
    topic: "Dynamic Programming",
    statement: "You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    constraints: ["1 <= n <= 45"],
    testCases: [{ input: "3", expectedOutput: "3" }],
    defaultCode: { python: "def solve(n):\n    pass", javascript: "function solve(n) {\n    \n}", java: "public int climbStairs(int n) {\n    return 0;\n}", cpp: "int climbStairs(int n) {}" }
  },
  {
    id: "invert-binary-tree",
    title: "Invert Binary Tree",
    difficulty: "Easy",
    topic: "Binary Tree",
    statement: "Given the `root` of a binary tree, invert the tree, and return its root.",
    constraints: ["The number of nodes in the tree is in the range [0, 100].", "-100 <= Node.val <= 100"],
    testCases: [{ input: "[4,2,7,1,3,6,9]", expectedOutput: "[4,7,2,9,6,3,1]" }],
    defaultCode: { python: "def solve(root):\n    pass", javascript: "function solve(root) {\n    \n}", java: "public TreeNode invertTree(TreeNode root) {\n    return null;\n}", cpp: "TreeNode* invertTree(TreeNode* root) {}" }
  },
  {
    id: "linked-list-cycle",
    title: "Linked List Cycle",
    difficulty: "Easy",
    topic: "Linked List",
    statement: "Given `head`, the head of a linked list, determine if the linked list has a cycle in it.",
    constraints: ["The number of the nodes in the list is in the range [0, 10^4].", "-10^5 <= Node.val <= 10^5"],
    testCases: [{ input: "head = [3,2,0,-4], pos = 1", expectedOutput: "true" }],
    defaultCode: { python: "def solve(head):\n    pass", javascript: "function solve(head) {\n    \n}", java: "public boolean hasCycle(ListNode head) {\n    return false;\n}", cpp: "bool hasCycle(ListNode *head) {}" }
  },
  {
    id: "valid-anagram",
    title: "Valid Anagram",
    difficulty: "Easy",
    topic: "Counting",
    statement: "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.",
    constraints: ["1 <= s.length, t.length <= 5 * 10^4", "s and t consist of lowercase English letters."],
    testCases: [{ input: "'anagram', 'nagaram'", expectedOutput: "true" }],
    defaultCode: { python: "def solve(s, t):\n    pass", javascript: "function solve(s, t) {\n    \n}", java: "public boolean isAnagram(String s, String t) {\n    return false;\n}", cpp: "bool isAnagram(string s, string t) {}" }
  },
  {
    id: "search-2d-matrix",
    title: "Search a 2D Matrix",
    difficulty: "Medium",
    topic: "Matrix",
    statement: "Write an efficient algorithm that searches for a value in an `m x n` matrix. This matrix has properties: Integers in each row are sorted from left to right. The first integer of each row is greater than the last integer of the previous row.",
    constraints: ["m == matrix.length", "n == matrix[i].length", "1 <= m, n <= 100"],
    testCases: [{ input: "[[1,3,5,7],[10,11,16,20],[23,30,34,60]], 3", expectedOutput: "true" }],
    defaultCode: { python: "def solve(matrix, target):\n    pass", javascript: "function solve(matrix, target) {\n    \n}", java: "public boolean searchMatrix(int[][] matrix, int target) {\n    return false;\n}", cpp: "bool searchMatrix(vector<vector<int>>& matrix, int target) {}" }
  },
  {
    id: "kth-largest-element",
    title: "Kth Largest Element in an Array",
    difficulty: "Medium",
    topic: "Heap",
    statement: "Given an integer array `nums` and an integer `k`, return the `k`-th largest element in the array.",
    constraints: ["1 <= k <= nums.length <= 10^4", "-10^4 <= nums[i] <= 10^4"],
    testCases: [{ input: "[3,2,1,5,6,4], 2", expectedOutput: "5" }],
    defaultCode: { python: "def solve(nums, k):\n    pass", javascript: "function solve(nums, k) {\n    \n}", java: "public int findKthLargest(int[] nums, int k) {\n    return 0;\n}", cpp: "int findKthLargest(vector<int>& nums, int k) {}" }
  },
  {
    id: "number-of-islands",
    title: "Number of Islands",
    difficulty: "Medium",
    topic: "Depth-First Search",
    statement: "Given an `m x n` 2D binary grid `grid` which represents a map of '1's (land) and '0's (water), return the number of islands.",
    constraints: ["m == grid.length", "n == grid[i].length", "1 <= m, n <= 300"],
    testCases: [{ input: "[['1','1','1','1','0'],['1','1','0','1','0'],['1','1','0','0','0'],['0','0','0','0','0']]", expectedOutput: "1" }],
    defaultCode: { python: "def solve(grid):\n    pass", javascript: "function solve(grid) {\n    \n}", java: "public int numIslands(char[][] grid) {\n    return 0;\n}", cpp: "int numIslands(vector<vector<char>>& grid) {}" }
  },
  {
    id: "longest-substring",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    topic: "Sliding Window",
    statement: "Given a string `s`, find the length of the longest substring without repeating characters.",
    constraints: ["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols and spaces."],
    testCases: [{ input: "'abcabcbb'", expectedOutput: "3" }],
    defaultCode: { python: "def solve(s):\n    pass", javascript: "function solve(s) {\n    \n}", java: "public int lengthOfLongestSubstring(String s) {\n    return 0;\n}", cpp: "int lengthOfLongestSubstring(string s) {}" }
  },
  {
    id: "container-with-most-water",
    title: "Container With Most Water",
    difficulty: "Medium",
    topic: "Two Pointers",
    statement: "Given `n` non-negative integers `height` where each represents a point at coordinate `(i, height[i])`. Find two lines that together with the x-axis form a container, such that the container contains the most water.",
    constraints: ["n == height.length", "2 <= n <= 10^5", "0 <= height[i] <= 10^4"],
    testCases: [{ input: "[1,8,6,2,5,4,8,3,7]", expectedOutput: "49" }],
    defaultCode: { python: "def solve(height):\n    pass", javascript: "function solve(height) {\n    \n}", java: "public int maxArea(int[] height) {\n    return 0;\n}", cpp: "int maxArea(vector<int>& height) {}" }
  },
  {
    id: "house-robber",
    title: "House Robber",
    difficulty: "Medium",
    topic: "Dynamic Programming",
    statement: "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. Return the maximum amount of money you can rob tonight without alerting the police.",
    constraints: ["1 <= nums.length <= 100", "0 <= nums[i] <= 400"],
    testCases: [{ input: "[1,2,3,1]", expectedOutput: "4" }],
    defaultCode: { python: "def solve(nums):\n    pass", javascript: "function solve(nums) {\n    \n}", java: "public int rob(int[] nums) {\n    return 0;\n}", cpp: "int rob(vector<int>& nums) {}" }
  },
  {
    id: "group-anagrams",
    title: "Group Anagrams",
    difficulty: "Medium",
    topic: "Counting",
    statement: "Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.",
    constraints: ["1 <= strs.length <= 10^4", "0 <= strs[i].length <= 100", "strs[i] consists of lowercase English letters."],
    testCases: [{ input: "['eat','tea','tan','ate','nat','bat']", expectedOutput: "[['eat','tea','ate'],['tan','nat'],['bat']]" }],
    defaultCode: { python: "def solve(strs):\n    pass", javascript: "function solve(strs) {\n    \n}", java: "public List<List<String>> groupAnagrams(String[] strs) {\n    return null;\n}", cpp: "vector<vector<string>> groupAnagrams(vector<string>& strs) {}" }
  },
  {
    id: "coin-change",
    title: "Coin Change",
    difficulty: "Medium",
    topic: "Dynamic Programming",
    statement: "You are given an array of integers `coins` representing coins of different denominations and an integer `amount` representing a total amount of money. Return the fewest number of coins that you need to make up that amount.",
    constraints: ["1 <= coins.length <= 12", "1 <= coins[i] <= 2^31 - 1", "0 <= amount <= 10^4"],
    testCases: [{ input: "[1,2,5], 11", expectedOutput: "3" }],
    defaultCode: { python: "def solve(coins, amount):\n    pass", javascript: "function solve(coins, amount) {\n    \n}", java: "public int coinChange(int[] coins, int amount) {\n    return -1;\n}", cpp: "int coinChange(vector<int>& coins, int amount) {}" }
  },
  {
    id: "top-k-frequent",
    title: "Top K Frequent Elements",
    difficulty: "Medium",
    topic: "Heap",
    statement: "Given an integer array `nums` and an integer `k`, return the `k` most frequent elements. You may return the answer in any order.",
    constraints: ["1 <= nums.length <= 10^5", "k is in the range [1, the number of unique elements in the array]."],
    testCases: [{ input: "[1,1,1,2,2,3], 2", expectedOutput: "[1,2]" }],
    defaultCode: { python: "def solve(nums, k):\n    pass", javascript: "function solve(nums, k) {\n    \n}", java: "public int[] topKFrequent(int[] nums, int k) {\n    return new int[]{};\n}", cpp: "vector<int> topKFrequent(vector<int>& nums, int k) {}" }
  },
  {
    id: "valid-sudoku",
    title: "Valid Sudoku",
    difficulty: "Medium",
    topic: "Matrix",
    statement: "Determine if a 9 x 9 Sudoku board is valid. Only the filled cells need to be validated according to the Sudoku rules.",
    constraints: ["board.length == 9", "board[i].length == 9", "board[i][j] is a digit 1-9 or '.'."],
    testCases: [{ input: "board = [['5','3','.','.',...]]", expectedOutput: "true" }],
    defaultCode: { python: "def solve(board):\n    pass", javascript: "function solve(board) {\n    \n}", java: "public boolean isValidSudoku(char[][] board) {\n    return false;\n}", cpp: "bool isValidSudoku(vector<vector<char>>& board) {}" }
  },
  {
    id: "product-array-except-self",
    title: "Product of Array Except Self",
    difficulty: "Medium",
    topic: "Prefix Sum",
    statement: "Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`.",
    constraints: ["2 <= nums.length <= 10^5", "-30 <= nums[i] <= 30"],
    testCases: [{ input: "[1,2,3,4]", expectedOutput: "[24,12,8,6]" }],
    defaultCode: { python: "def solve(nums):\n    pass", javascript: "function solve(nums) {\n    \n}", java: "public int[] productExceptSelf(int[] nums) {\n    return new int[]{};\n}", cpp: "vector<int> productExceptSelf(vector<int>& nums) {}" }
  },
  {
    id: "longest-consecutive-sequence",
    title: "Longest Consecutive Sequence",
    difficulty: "Medium",
    topic: "Counting",
    statement: "Given an unsorted array of integers `nums`, return the length of the longest consecutive elements sequence.",
    constraints: ["0 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"],
    testCases: [{ input: "[100,4,200,1,3,2]", expectedOutput: "4" }],
    defaultCode: { python: "def solve(nums):\n    pass", javascript: "function solve(nums) {\n    \n}", java: "public int longestConsecutive(int[] nums) {\n    return 0;\n}", cpp: "int longestConsecutive(vector<int>& nums) {}" }
  },
  {
    id: "rotated-sorted-array",
    title: "Search in Rotated Sorted Array",
    difficulty: "Medium",
    topic: "Binary Search",
    statement: "Given the array `nums` after the possible rotation and an integer `target`, return the index of `target` if it is in `nums`, or -1 if it is not in `nums`.",
    constraints: ["1 <= nums.length <= 5000", "-10^4 <= nums[i], target <= 10^4"],
    testCases: [{ input: "[4,5,6,7,0,1,2], 0", expectedOutput: "4" }],
    defaultCode: { python: "def solve(nums, target):\n    pass", javascript: "function solve(nums, target) {\n    \n}", java: "public int search(int[] nums, int target) {\n    return -1;\n}", cpp: "int search(vector<int>& nums, int target) {}" }
  },
  {
    id: "3sum",
    title: "3Sum",
    difficulty: "Medium",
    topic: "Two Pointers",
    statement: "Given an integer array nums, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.",
    constraints: ["3 <= nums.length <= 3000", "-10^5 <= nums[i] <= 10^5"],
    testCases: [{ input: "[-1,0,1,2,-1,-4]", expectedOutput: "[[-1,-1,2],[-1,0,1]]" }],
    defaultCode: { python: "def solve(nums):\n    pass", javascript: "function solve(nums) {\n    \n}", java: "public List<List<Integer>> threeSum(int[] nums) {\n    return null;\n}", cpp: "vector<vector<int>> threeSum(vector<int>& nums) {}" }
  },
  {
    id: "daily-temperatures",
    title: "Daily Temperatures",
    difficulty: "Medium",
    topic: "Stack",
    statement: "Given an array of integers `temperatures` represents the daily temperatures, return an array `answer` such that `answer[i]` is the number of days you have to wait after the `i`-th day to get a warmer temperature.",
    constraints: ["1 <= temperatures.length <= 10^5", "30 <= temperatures[i] <= 100"],
    testCases: [{ input: "[73,74,75,71,69,72,76,73]", expectedOutput: "[1,1,4,2,1,1,0,0]" }],
    defaultCode: { python: "def solve(temperatures):\n    pass", javascript: "function solve(temperatures) {\n    \n}", java: "public int[] dailyTemperatures(int[] temperatures) {\n    return new int[]{};\n}", cpp: "vector<int> dailyTemperatures(vector<int>& temperatures) {}" }
  },
  {
    id: "level-order-traversal",
    title: "Binary Tree Level Order Traversal",
    difficulty: "Medium",
    topic: "Binary Tree",
    statement: "Given the `root` of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).",
    constraints: ["The number of nodes in the tree is in the range [0, 2000].", "-1000 <= Node.val <= 1000"],
    testCases: [{ input: "[3,9,20,null,null,15,7]", expectedOutput: "[[3],[9,20],[15,7]]" }],
    defaultCode: { python: "def solve(root):\n    pass", javascript: "function solve(root) {\n    \n}", java: "public List<List<Integer>> levelOrder(TreeNode root) {\n    return null;\n}", cpp: "vector<vector<int>> levelOrder(TreeNode* root) {}" }
  },
  {
    id: "max-depth-binary-tree",
    title: "Maximum Depth of Binary Tree",
    difficulty: "Easy",
    topic: "Binary Tree",
    statement: "Given the root of a binary tree, return its maximum depth.",
    constraints: ["The number of nodes in the tree is in the range [0, 10^4].", "-100 <= Node.val <= 100"],
    testCases: [{ input: "[3,9,20,null,null,15,7]", expectedOutput: "3" }],
    defaultCode: { python: "def solve(root):\n    return 0", javascript: "function solve(root) {\n    return 0;\n}", java: "public int maxDepth(TreeNode root) {\n    return 0;\n}", cpp: "int maxDepth(TreeNode* root) {}" }
  },
  {
    id: "single-number",
    title: "Single Number",
    difficulty: "Easy",
    topic: "Bit Manipulation",
    statement: "Given a non-empty array of integers `nums`, every element appears twice except for one. Find that single one.",
    constraints: ["1 <= nums.length <= 3 * 10^4", "-3 * 10^4 <= nums[i] <= 3 * 10^4"],
    testCases: [{ input: "[4,1,2,1,2]", expectedOutput: "4" }],
    defaultCode: { python: "def solve(nums):\n    pass", javascript: "function solve(nums) {\n    \n}", java: "public int singleNumber(int[] nums) {\n    return 0;\n}", cpp: "int singleNumber(vector<int>& nums) {}" }
  },
  {
    id: "counting-bits",
    title: "Counting Bits",
    difficulty: "Easy",
    topic: "Bit Manipulation",
    statement: "Given an integer `n`, return an array `ans` of length `n + 1` such that for each `i` (`0 <= i <= n`), `ans[i]` is the number of `1`'s in the binary representation of `i`.",
    constraints: ["0 <= n <= 10^5"],
    testCases: [{ input: "5", expectedOutput: "[0,1,1,2,1,2]" }],
    defaultCode: { python: "def solve(n):\n    pass", javascript: "function solve(n) {\n    \n}", java: "public int[] countBits(int n) {\n    return new int[]{};\n}", cpp: "vector<int> countBits(int n) {}" }
  },
  {
    id: "reverse-linked-list",
    title: "Reverse Linked List",
    difficulty: "Easy",
    topic: "Linked List",
    statement: "Given the `head` of a singly linked list, reverse the list, and return the reversed list.",
    constraints: ["The number of nodes in the list is the range [0, 5000].", "-5000 <= Node.val <= 5000"],
    testCases: [{ input: "[1,2,3,4,5]", expectedOutput: "[5,4,3,2,1]" }],
    defaultCode: { python: "def solve(head):\n    pass", javascript: "function solve(head) {\n    \n}", java: "public ListNode reverseList(ListNode head) {\n    return null;\n}", cpp: "ListNode* reverseList(ListNode* head) {}" }
  },
  {
    id: "longest-repeating-replacement",
    title: "Longest Repeating Character Replacement",
    difficulty: "Medium",
    topic: "Sliding Window",
    statement: "You are given a string `s` and an integer `k`. You can choose any character of the string and change it to any other uppercase English character. You can perform this operation at most `k` times.",
    constraints: ["1 <= s.length <= 10^5", "0 <= k <= s.length", "s consists of only uppercase English letters."],
    testCases: [{ input: "'ABAB', 2", expectedOutput: "4" }],
    defaultCode: { python: "def solve(s, k):\n    pass", javascript: "function solve(s, k) {\n    \n}", java: "public int characterReplacement(String s, int k) {\n    return 0;\n}", cpp: "int characterReplacement(string s, int k) {}" }
  },
  {
    id: "permutations",
    title: "Permutations",
    difficulty: "Medium",
    topic: "Recursion",
    statement: "Given an array `nums` of distinct integers, return all the possible permutations. You can return the answer in any order.",
    constraints: ["1 <= nums.length <= 6", "-10 <= nums[i] <= 10", "All the integers of nums are unique."],
    testCases: [{ input: "[1,2,3]", expectedOutput: "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]" }],
    defaultCode: { python: "def solve(nums):\n    pass", javascript: "function solve(nums) {\n    \n}", java: "public List<List<Integer>> permute(int[] nums) {\n    return null;\n}", cpp: "vector<vector<int>> permute(vector<int>& nums) {}" }
  },
  {
    id: "word-search",
    title: "Word Search",
    difficulty: "Medium",
    topic: "Depth-First Search",
    statement: "Given an `m x n` grid of characters `board` and a string `word`, return `true` if `word` exists in the grid.",
    constraints: ["m == board.length", "n = board[i].length", "1 <= m, n <= 6", "1 <= word.length <= 15"],
    testCases: [{ input: "board = [['A','B','C','E'],['S','F','C','S'],['A','D','E','E']], word = 'ABCCED'", expectedOutput: "true" }],
    defaultCode: { python: "def solve(board, word):\n    pass", javascript: "function solve(board, word) {\n    \n}", java: "public boolean exist(char[][] board, String word) {\n    return false;\n}", cpp: "bool exist(vector<vector<char>>& board, string word) {}" }
  },
  {
    id: "cloning-graph",
    title: "Clone Graph",
    difficulty: "Medium",
    topic: "Graph Theory",
    statement: "Given a reference of a node in a connected undirected graph. Return a deep copy (clone) of the graph.",
    constraints: ["The number of nodes in the graph is in the range [0, 100].", "1 <= Node.val <= 100", "Node.val is unique for each node."],
    testCases: [{ input: "[[2,4],[1,3],[2,4],[1,3]]", expectedOutput: "[[2,4],[1,3],[2,4],[1,3]]" }],
    defaultCode: { python: "def solve(node):\n    pass", javascript: "function solve(node) {\n    \n}", java: "public Node cloneGraph(Node node) {\n    return null;\n}", cpp: "Node* cloneGraph(Node* node) {}" }
  },
  {
    id: "pacific-atlantic-water-flow",
    title: "Pacific Atlantic Water Flow",
    difficulty: "Medium",
    topic: "Depth-First Search",
    statement: "There is an `m x n` rectangular island that borders both the Pacific Ocean and Atlantic Ocean. The island is partitioned into a grid of unit cells. Return a list of grid coordinates where water can flow to both oceans.",
    constraints: ["m == heights.length", "n == heights[i].length", "1 <= m, n <= 200"],
    testCases: [{ input: "[[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]", expectedOutput: "[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]" }],
    defaultCode: { python: "def solve(heights):\n    pass", javascript: "function solve(heights) {\n    \n}", java: "public List<List<Integer>> pacificAtlantic(int[][] heights) {\n    return null;\n}", cpp: "vector<vector<int>> pacificAtlantic(vector<vector<int>>& heights) {}" }
  },
  {
    id: "binary-tree-max-path",
    title: "Binary Tree Maximum Path Sum",
    difficulty: "Hard",
    topic: "Binary Tree",
    statement: "A path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. Return the maximum path sum of any non-empty path.",
    constraints: ["The number of nodes in the tree is in the range [1, 3 * 10^4].", "-1000 <= Node.val <= 1000"],
    testCases: [{ input: "[1,2,3]", expectedOutput: "6" }],
    defaultCode: { python: "def solve(root):\n    pass", javascript: "function solve(root) {\n    \n}", java: "public int maxPathSum(TreeNode root) {\n    return 0;\n}", cpp: "int maxPathSum(TreeNode* root) {}" }
  },
  {
    id: "median-two-sorted-arrays",
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    topic: "Binary Search",
    statement: "Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays. The overall run time complexity should be `O(log (m+n))`.",
    constraints: ["nums1.length == m", "nums2.length == n", "0 <= m, n <= 1000", "1 <= m + n <= 2000"],
    testCases: [{ input: "[1,3], [2]", expectedOutput: "2.0" }],
    defaultCode: { python: "def solve(nums1, nums2):\n    pass", javascript: "function solve(nums1, nums2) {\n    \n}", java: "public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n    return 0.0;\n}", cpp: "double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {}" }
  },
  {
    id: "trapping-rain-water",
    title: "Trapping Rain Water",
    difficulty: "Hard",
    topic: "Two Pointers",
    statement: "Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    constraints: ["n == height.length", "1 <= n <= 2 * 10^4", "0 <= height[i] <= 10^5"],
    testCases: [{ input: "[0,1,0,2,1,0,1,3,2,1,2,1]", expectedOutput: "6" }],
    defaultCode: { python: "def solve(height):\n    pass", javascript: "function solve(height) {\n    \n}", java: "public int trap(int[] height) {\n    return 0;\n}", cpp: "int trap(vector<int>& height) {}" }
  },
  {
    id: "sliding-window-maximum",
    title: "Sliding Window Maximum",
    difficulty: "Hard",
    topic: "Sliding Window",
    statement: "You are given an array of integers `nums`, there is a sliding window of size `k` which is moving from the very left of the array to the very right. Return the max sliding window.",
    constraints: ["1 <= nums.length <= 10^5", "1 <= k <= nums.length"],
    testCases: [{ input: "[1,3,-1,-3,5,3,6,7], 3", expectedOutput: "[3,3,5,5,6,7]" }],
    defaultCode: { python: "def solve(nums, k):\n    pass", javascript: "function solve(nums, k) {\n    \n}", java: "public int[] maxSlidingWindow(int[] nums, int k) {\n    return new int[]{};\n}", cpp: "vector<int> maxSlidingWindow(vector<int>& nums, int k) {}" }
  },
  {
    id: "merge-k-sorted-lists",
    title: "Merge k Sorted Lists",
    difficulty: "Hard",
    topic: "Linked List",
    statement: "You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
    constraints: ["k == lists.length", "0 <= k <= 10^4", "0 <= lists[i].length <= 500"],
    testCases: [{ input: "[[1,4,5],[1,3,4],[2,6]]", expectedOutput: "[1,1,2,3,4,4,5,6]" }],
    defaultCode: { python: "def solve(lists):\n    pass", javascript: "function solve(lists) {\n    \n}", java: "public ListNode mergeKLists(ListNode[] lists) {\n    return null;\n}", cpp: "ListNode* mergeKLists(vector<ListNode*>& lists) {}" }
  },
  {
    id: "gas-station",
    title: "Gas Station",
    difficulty: "Medium",
    topic: "Greedy",
    statement: "There are `n` gas stations along a circular route, where the amount of gas at the `i`-th station is `gas[i]`. You have a car with an unlimited gas tank and it costs `cost[i]` of gas to travel from the `i`-th station to its next `(i + 1)`-th station. Return the starting gas station's index if you can travel around the circuit once in the clockwise direction, otherwise return -1.",
    constraints: ["n == gas.length == cost.length", "1 <= n <= 10^5"],
    testCases: [{ input: "[1,2,3,4,5], [3,4,5,1,2]", expectedOutput: "3" }],
    defaultCode: { python: "def solve(gas, cost):\n    pass", javascript: "function solve(gas, cost) {\n    \n}", java: "public int canCompleteCircuit(int[] gas, int[] cost) {\n    return -1;\n}", cpp: "int canCompleteCircuit(vector<int>& gas, vector<int>& cost) {}" }
  },
  {
    id: "jump-game",
    title: "Jump Game",
    difficulty: "Medium",
    topic: "Greedy",
    statement: "You are given an integer array `nums`. You are initially positioned at the array's first index, and each element in the array represents your maximum jump length at that position. Return `true` if you can reach the last index, or `false` otherwise.",
    constraints: ["1 <= nums.length <= 10^4", "0 <= nums[i] <= 10^5"],
    testCases: [{ input: "[2,3,1,1,4]", expectedOutput: "true" }],
    defaultCode: { python: "def solve(nums):\n    pass", javascript: "function solve(nums) {\n    \n}", java: "public boolean canJump(int[] nums) {\n    return false;\n}", cpp: "bool canJump(vector<int>& nums) {}" }
  },
  {
    id: "word-break",
    title: "Word Break",
    difficulty: "Medium",
    topic: "Dynamic Programming",
    statement: "Given a string `s` and a dictionary of strings `wordDict`, return `true` if `s` can be segmented into a space-separated sequence of one or more dictionary words.",
    constraints: ["1 <= s.length <= 300", "wordDict.length <= 1000"],
    testCases: [{ input: "'leetcode', ['leet','code']", expectedOutput: "true" }],
    defaultCode: { python: "def solve(s, wordDict):\n    pass", javascript: "function solve(s, wordDict) {\n    \n}", java: "public boolean wordBreak(String s, List<String> wordDict) {\n    return false;\n}", cpp: "bool wordBreak(string s, vector<string>& wordDict) {}" }
  },
  {
    id: "palindromic-substrings",
    title: "Palindromic Substrings",
    difficulty: "Medium",
    topic: "Recursion",
    statement: "Given a string `s`, return the number of palindromic substrings in it.",
    constraints: ["1 <= s.length <= 1000", "s consists of lowercase English letters."],
    testCases: [{ input: "'abc'", expectedOutput: "3" }, { input: "'aaa'", expectedOutput: "6" }],
    defaultCode: { python: "def solve(s):\n    pass", javascript: "function solve(s) {\n    \n}", java: "public int countSubstrings(String s) {\n    return 0;\n}", cpp: "int countSubstrings(string s) {}" }
  },
  {
    id: "path-sum",
    title: "Path Sum",
    difficulty: "Easy",
    topic: "Binary Tree",
    statement: "Given the `root` of a binary tree and an integer `targetSum`, return `true` if the tree has a root-to-leaf path such that adding up all the values along the path equals `targetSum`.",
    constraints: ["The number of nodes in the tree is in the range [0, 5000].", "-1000 <= Node.val <= 1000"],
    testCases: [{ input: "[5,4,8,11,null,13,4,7,2,null,null,null,1], 22", expectedOutput: "true" }],
    defaultCode: { python: "def solve(root, targetSum):\n    pass", javascript: "function solve(root, targetSum) {\n    \n}", java: "public boolean hasPathSum(TreeNode root, int targetSum) {\n    return false;\n}", cpp: "bool hasPathSum(TreeNode* root, int targetSum) {}" }
  },
  {
    id: "diameter-binary-tree",
    title: "Diameter of Binary Tree",
    difficulty: "Easy",
    topic: "Binary Tree",
    statement: "Given the root of a binary tree, return the length of the diameter of the tree. The diameter of a binary tree is the length of the longest path between any two nodes in a tree.",
    constraints: ["The number of nodes in the tree is in the range [1, 10^4].", "-100 <= Node.val <= 100"],
    testCases: [{ input: "[1,2,3,4,5]", expectedOutput: "3" }],
    defaultCode: { python: "def solve(root):\n    pass", javascript: "function solve(root) {\n    \n}", java: "public int diameterOfBinaryTree(TreeNode root) {\n    return 0;\n}", cpp: "int diameterOfBinaryTree(TreeNode* root) {}" }
  },
  {
    id: "balanced-binary-tree",
    title: "Balanced Binary Tree",
    difficulty: "Easy",
    topic: "Binary Tree",
    statement: "Given a binary tree, determine if it is height-balanced.",
    constraints: ["The number of nodes in the tree is in the range [0, 5000].", "-10^4 <= Node.val <= 10^4"],
    testCases: [{ input: "[3,9,20,null,null,15,7]", expectedOutput: "true" }],
    defaultCode: { python: "def solve(root):\n    pass", javascript: "function solve(root) {\n    \n}", java: "public boolean isBalanced(TreeNode root) {\n    return false;\n}", cpp: "bool isBalanced(TreeNode* root) {}" }
  },
  {
    id: "subtree-another-tree",
    title: "Subtree of Another Tree",
    difficulty: "Easy",
    topic: "Binary Tree",
    statement: "Given the roots of two binary trees `root` and `subRoot`, return `true` if there is a subtree of `root` with the same structure and node values of `subRoot` and `false` otherwise.",
    constraints: ["The number of nodes in the root tree is in the range [1, 2000].", "-10^4 <= Node.val <= 10^4"],
    testCases: [{ input: "[3,4,5,1,2], [4,1,2]", expectedOutput: "true" }],
    defaultCode: { python: "def solve(root, subRoot):\n    pass", javascript: "function solve(root, subRoot) {\n    \n}", java: "public boolean isSubtree(TreeNode root, TreeNode subRoot) {\n    return false;\n}", cpp: "bool isSubtree(TreeNode* root, TreeNode* subRoot) {}" }
  },
  {
    id: "lowest-common-ancestor",
    title: "Lowest Common Ancestor of a Binary Search Tree",
    difficulty: "Easy",
    topic: "Binary Search",
    statement: "Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes in the BST.",
    constraints: ["The number of nodes in the tree is in the range [2, 10^5].", "All Node.val are unique."],
    testCases: [{ input: "[6,2,8,0,4,7,9,null,null,3,5], 2, 8", expectedOutput: "6" }],
    defaultCode: { python: "def solve(root, p, q):\n    pass", javascript: "function solve(root, p, q) {\n    \n}", java: "public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {\n    return null;\n}", cpp: "TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {}" }
  },
  {
    id: "construct-bt-preorder-inorder",
    title: "Construct Binary Tree from Preorder and Inorder Traversal",
    difficulty: "Medium",
    topic: "Binary Tree",
    statement: "Given two integer arrays `preorder` and `inorder` where `preorder` is the preorder traversal of a binary tree and `inorder` is the inorder traversal of the same tree, construct and return the binary tree.",
    constraints: ["1 <= preorder.length <= 3000", "inorder.length == preorder.length"],
    testCases: [{ input: "[3,9,20,15,7], [9,3,15,20,7]", expectedOutput: "[3,9,20,null,null,15,7]" }],
    defaultCode: { python: "def solve(preorder, inorder):\n    pass", javascript: "function solve(preorder, inorder) {\n    \n}", java: "public TreeNode buildTree(int[] preorder, int[] inorder) {\n    return null;\n}", cpp: "TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {}" }
  },
  {
    id: "kth-smallest-bst",
    title: "Kth Smallest Element in a BST",
    difficulty: "Medium",
    topic: "Binary Tree",
    statement: "Given the `root` of a binary search tree, and an integer `k`, return the `k`-th smallest value (1-indexed) of all the values of the nodes in the tree.",
    constraints: ["The number of nodes in the tree is n.", "1 <= k <= n <= 10^4", "0 <= Node.val <= 10^4"],
    testCases: [{ input: "[3,1,4,null,2], 1", expectedOutput: "1" }],
    defaultCode: { python: "def solve(root, k):\n    pass", javascript: "function solve(root, k) {\n    \n}", java: "public int kthSmallest(TreeNode root, int k) {\n    return 0;\n}", cpp: "int kthSmallest(TreeNode* root, int k) {}" }
  },
  {
    id: "binary-tree-right-side-view",
    title: "Binary Tree Right Side View",
    difficulty: "Medium",
    topic: "Binary Tree",
    statement: "Given the `root` of a binary tree, imagine yourself standing on the right side of it, return the values of the nodes you can see ordered from top to bottom.",
    constraints: ["The number of nodes in the tree is in the range [0, 100].", "-100 <= Node.val <= 100"],
    testCases: [{ input: "[1,2,3,null,5,null,4]", expectedOutput: "[1,3,4]" }],
    defaultCode: { python: "def solve(root):\n    pass", javascript: "function solve(root) {\n    \n}", java: "public List<Integer> rightSideView(TreeNode root) {\n    return null;\n}", cpp: "vector<int> rightSideView(TreeNode* root) {}" }
  },
  {
    id: "serialize-deserialize-binary-tree",
    title: "Serialize and Deserialize Binary Tree",
    difficulty: "Hard",
    topic: "Binary Tree",
    statement: "Design an algorithm to serialize and deserialize a binary tree. There is no restriction on how your serialization/deserialization algorithm should work.",
    constraints: ["The number of nodes in the tree is in the range [0, 10^4].", "-1000 <= Node.val <= 1000"],
    testCases: [{ input: "[1,2,3,null,null,4,5]", expectedOutput: "[1,2,3,null,null,4,5]" }],
    defaultCode: { python: "class Codec:\n    def serialize(self, root):\n        pass\n    def deserialize(self, data):\n        pass", javascript: "var serialize = function(root) {}; var deserialize = function(data) {};", java: "public class Codec { public String serialize(TreeNode root) {return \"\";} public TreeNode deserialize(String data) {return null;} }", cpp: "class Codec { public: string serialize(TreeNode* root) {} TreeNode* deserialize(string data) {} };" }
  },
  {
    id: "course-schedule",
    title: "Course Schedule",
    difficulty: "Medium",
    topic: "Graph Theory",
    statement: "There are a total of `numCourses` courses you have to take, labeled from `0` to `numCourses - 1`. You are given an array `prerequisites` where `prerequisites[i] = [ai, bi]` indicates that you must take course `bi` if you want to take course `ai`. Return `true` if you can finish all courses.",
    constraints: ["1 <= numCourses <= 2000", "0 <= prerequisites.length <= 5000"],
    testCases: [{ input: "2, [[1,0]]", expectedOutput: "true" }, { input: "2, [[1,0],[0,1]]", expectedOutput: "false" }],
    defaultCode: { python: "def solve(numCourses, prerequisites):\n    pass", javascript: "function solve(numCourses, prerequisites) {\n    \n}", java: "public boolean canFinish(int numCourses, int[][] prerequisites) {\n    return false;\n}", cpp: "bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {}" }
  },
  {
    id: "course-schedule-ii",
    title: "Course Schedule II",
    difficulty: "Medium",
    topic: "Graph Theory",
    statement: "Given the total number of courses `numCourses` and an array of `prerequisites`, return the ordering of courses you should take to finish all courses. If there are many valid answers, return any of them.",
    constraints: ["1 <= numCourses <= 2000", "0 <= prerequisites.length <= numCourses * (numCourses - 1)"],
    testCases: [{ input: "2, [[1,0]]", expectedOutput: "[0,1]" }],
    defaultCode: { python: "def solve(numCourses, prerequisites):\n    pass", javascript: "function solve(numCourses, prerequisites) {\n    \n}", java: "public int[] findOrder(int numCourses, int[][] prerequisites) {\n    return new int[]{};\n}", cpp: "vector<int> findOrder(int numCourses, vector<vector<int>>& prerequisites) {}" }
  },
  {
    id: "word-ladder",
    title: "Word Ladder",
    difficulty: "Hard",
    topic: "Breadth-First Search",
    statement: "Given two words, `beginWord` and `endWord`, and a dictionary `wordList`, return the length of the shortest transformation sequence from `beginWord` to `endWord`, such that only one letter can be changed at a time.",
    constraints: ["1 <= beginWord.length <= 10", "wordList.length <= 5000"],
    testCases: [{ input: "'hit', 'cog', ['hot','dot','dog','lot','log','cog']", expectedOutput: "5" }],
    defaultCode: { python: "def solve(beginWord, endWord, wordList):\n    pass", javascript: "function solve(beginWord, endWord, wordList) {\n    \n}", java: "public int ladderLength(String beginWord, String endWord, List<String> wordList) {\n    return 0;\n}", cpp: "int ladderLength(string beginWord, string endWord, vector<string>& wordList) {}" }
  },
  {
    id: "is-graph-bipartite",
    title: "Is Graph Bipartite?",
    difficulty: "Medium",
    topic: "Graph Theory",
    statement: "There is an undirected graph with `n` nodes, where each node is numbered from `0` to `n - 1`. Return `true` if the graph is bipartite.",
    constraints: ["graph.length == n", "1 <= n <= 100"],
    testCases: [{ input: "[[1,2,3],[0,2],[0,1,3],[0,2]]", expectedOutput: "false" }],
    defaultCode: { python: "def solve(graph):\n    pass", javascript: "function solve(graph) {\n    \n}", java: "public boolean isBipartite(int[][] graph) {\n    return false;\n}", cpp: "bool isBipartite(vector<vector<int>>& graph) {}" }
  },
  {
    id: "redundant-connection",
    title: "Redundant Connection",
    difficulty: "Medium",
    topic: "Graph Theory",
    statement: "In this problem, a tree is an undirected graph that is connected and has no cycles. You are given a graph that started as a tree with `n` nodes, but one additional edge was added. Find the redundant edge.",
    constraints: ["n == edges.length", "3 <= n <= 1000"],
    testCases: [{ input: "[[1,2],[1,3],[2,3]]", expectedOutput: "[2,3]" }],
    defaultCode: { python: "def solve(edges):\n    pass", javascript: "function solve(edges) {\n    \n}", java: "public int[] findRedundantConnection(int[][] edges) {\n    return new int[]{};\n}", cpp: "vector<int> findRedundantConnection(vector<vector<int>>& edges) {}" }
  },
  {
    id: "alien-dictionary",
    title: "Alien Dictionary",
    difficulty: "Hard",
    topic: "Graph Theory",
    statement: "There is a new alien language that uses the English alphabet. However, the order among letters is unknown to you. You are given a list of words from the alien language dictionary, where the words in each group are sorted lexicographically by the rules of this new language. Return the order of the letters.",
    constraints: ["1 <= words.length <= 100", "1 <= words[i].length <= 100"],
    testCases: [{ input: "['wrt','wrf','er',...]", expectedOutput: "'wertf'" }],
    defaultCode: { python: "def solve(words):\n    pass", javascript: "function solve(words) {\n    \n}", java: "public String alienOrder(String[] words) {\n    return \"\";\n}", cpp: "string alienOrder(vector<string>& words) {}" }
  },
  {
    id: "detect-cycle-directed-graph",
    title: "Detect Cycle in a Directed Graph",
    difficulty: "Medium",
    topic: "Graph Theory",
    statement: "Given a directed graph, check whether the graph contains a cycle or not. Your function should return true if the given graph contains at least one cycle, else return false.",
    constraints: ["1 <= V, E <= 10^4"],
    testCases: [{ input: "V=4, edges=[[0,1],[1,2],[2,3],[3,3]]", expectedOutput: "true" }],
    defaultCode: { python: "def solve(V, adj):\n    pass", javascript: "function solve(V, adj) {\n    \n}", java: "public boolean isCyclic(int V, ArrayList<ArrayList<Integer>> adj) {\n    return false;\n}", cpp: "bool isCyclic(int V, vector<int> adj[]) {}" }
  },
  {
    id: "find-the-celebrity",
    title: "Find the Celebrity",
    difficulty: "Medium",
    topic: "Two Pointers",
    statement: "Suppose you are at a party with `n` people (labeled from `0` to `n - 1`) and among them, there may exist one celebrity. If the celebrity exists, then everyone at the party knows the celebrity, but the celebrity does not know any of them.",
    constraints: ["n == people.length", "2 <= n <= 100"],
    testCases: [{ input: "knows(a, b) matrix", expectedOutput: "1" }],
    defaultCode: { python: "def solve(n):\n    pass", javascript: "function solve(n) {\n    \n}", java: "public int findCelebrity(int n) {\n    return -1;\n}", cpp: "int findCelebrity(int n) {}" }
  },
  {
    id: "valid-palindrome-ii",
    title: "Valid Palindrome II",
    difficulty: "Easy",
    topic: "Two Pointers",
    statement: "Given a string `s`, return `true` if the `s` can be palindrome after deleting at most one character from it.",
    constraints: ["1 <= s.length <= 10^5", "s consists of lowercase English letters."],
    testCases: [{ input: "'aba'", expectedOutput: "true" }, { input: "'abca'", expectedOutput: "true" }],
    defaultCode: { python: "def solve(s):\n    pass", javascript: "function solve(s) {\n    \n}", java: "public boolean validPalindrome(String s) {\n    return false;\n}", cpp: "bool validPalindrome(string s) {}" }
  },
  {
    id: "min-window-substring",
    title: "Minimum Window Substring",
    difficulty: "Hard",
    topic: "Sliding Window",
    statement: "Given two strings `s` and `t` of lengths `m` and `n` respectively, return the minimum window substring of `s` such that every character in `t` (including duplicates) is included in the window.",
    constraints: ["m == s.length", "n == t.length", "1 <= m, n <= 10^5"],
    testCases: [{ input: "'ADOBECODEBANC', 'ABC'", expectedOutput: "'BANC'" }],
    defaultCode: { python: "def solve(s, t):\n    pass", javascript: "function solve(s, t) {\n    \n}", java: "public String minWindow(String s, String t) {\n    return \"\";\n}", cpp: "string minWindow(string s, string t) {}" }
  },
  {
    id: "decode-string",
    title: "Decode String",
    difficulty: "Medium",
    topic: "Stack",
    statement: "Given an encoded string, return its decoded string. The encoding rule is: `k[encoded_string]`, where the `encoded_string` inside the square brackets is being repeated exactly `k` times.",
    constraints: ["1 <= s.length <= 30", "s consists of lowercase English letters, digits, and square brackets '[]'."],
    testCases: [{ input: "'3[a]2[bc]'", expectedOutput: "'aaabcbc'" }],
    defaultCode: { python: "def solve(s):\n    pass", javascript: "function solve(s) {\n    \n}", java: "public String decodeString(String s) {\n    return \"\";\n}", cpp: "string decodeString(string s) {}" }
  },
  {
    id: "remove-invalid-parentheses",
    title: "Remove Invalid Parentheses",
    difficulty: "Hard",
    topic: "Breadth-First Search",
    statement: "Given a string `s` that contains parentheses and letters, remove the minimum number of invalid parentheses to make the input string valid. Return all possible results. You may return the answer in any order.",
    constraints: ["1 <= s.length <= 25", "s consists of lowercase English letters and parentheses '(' and ')'."],
    testCases: [{ input: "'()())()'", expectedOutput: "['(())()','()()()']" }],
    defaultCode: { python: "def solve(s):\n    pass", javascript: "function solve(s) {\n    \n}", java: "public List<String> removeInvalidParentheses(String s) {\n    return null;\n}", cpp: "vector<string> removeInvalidParentheses(string s) {}" }
  },
  {
    id: "evaluate-reverse-polish-notation",
    title: "Evaluate Reverse Polish Notation",
    difficulty: "Medium",
    topic: "Stack",
    statement: "Evaluate the value of an arithmetic expression in Reverse Polish Notation. Valid operators are +, -, *, and /.",
    constraints: ["1 <= tokens.length <= 10^4", "tokens[i] is either an operator or an integer."],
    testCases: [{ input: "['2','1','+','3','*']", expectedOutput: "9" }],
    defaultCode: { python: "def solve(tokens):\n    pass", javascript: "function solve(tokens) {\n    \n}", java: "public int evalRPN(String[] tokens) {\n    return 0;\n}", cpp: "int evalRPN(vector<string>& tokens) {}" }
  },
  {
    id: "min-stack",
    title: "Min Stack",
    difficulty: "Medium",
    topic: "Stack",
    statement: "Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.",
    constraints: ["Methods push, pop, top, and getMin should have O(1) time complexity.", "1 <= val <= 2^31 - 1"],
    testCases: [{ input: "push(-2), push(0), push(-3), getMin(), pop(), top(), getMin()", expectedOutput: "-3, 0, -2" }],
    defaultCode: { python: "class MinStack:\n    def __init__(self):\n        pass", javascript: "var MinStack = function() {};", java: "class MinStack { public MinStack() {} }", cpp: "class MinStack { public: MinStack() {} };" }
  },
  {
    id: "implement-queue-stacks",
    title: "Implement Queue using Stacks",
    difficulty: "Easy",
    topic: "Stack",
    statement: "Implement a first in first out (FIFO) queue using only two stacks. The implemented queue should support all the functions of a normal queue (push, peek, pop, and empty).",
    constraints: ["1 <= x <= 9", "At most 100 calls will be made to push, pop, peek, and empty."],
    testCases: [{ input: "push(1), push(2), peek(), pop(), empty()", expectedOutput: "1, 1, false" }],
    defaultCode: { python: "class MyQueue:\n    def __init__(self):\n        pass", javascript: "var MyQueue = function() {};", java: "class MyQueue { public MyQueue() {} }", cpp: "class MyQueue { public: MyQueue() {} };" }
  },
  {
    id: "task-scheduler",
    title: "Task Scheduler",
    difficulty: "Medium",
    topic: "Greedy",
    statement: "Given a characters array `tasks`, representing the tasks a CPU needs to do, and an integer `n` representing the cooldown period, return the least number of units of times that the CPU will take to finish all the given tasks.",
    constraints: ["1 <= tasks.length <= 10^4", "0 <= n <= 100"],
    testCases: [{ input: "['A','A','A','B','B','B'], 2", expectedOutput: "8" }],
    defaultCode: { python: "def solve(tasks, n):\n    pass", javascript: "function solve(tasks, n) {\n    \n}", java: "public int leastInterval(char[] tasks, int n) {\n    return 0;\n}", cpp: "int leastInterval(vector<char>& tasks, int n) {}" }
  },
  {
    id: "lru-cache",
    title: "LRU Cache",
    difficulty: "Medium",
    topic: "Linked List",
    statement: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.",
    constraints: ["1 <= capacity <= 3000", "0 <= key <= 10^4", "0 <= value <= 10^5"],
    testCases: [{ input: "LRUCache(2), put(1, 1), put(2, 2), get(1), put(3, 3), get(2), put(4, 4), get(1), get(3), get(4)", expectedOutput: "1, -1, -1, 3, 4" }],
    defaultCode: { python: "class LRUCache:\n    def __init__(self, capacity):\n        pass", javascript: "var LRUCache = function(capacity) {};", java: "class LRUCache { public LRUCache(int capacity) {} }", cpp: "class LRUCache { public: LRUCache(int capacity) {} };" }
  },
  {
    id: "house-robber-ii",
    title: "House Robber II",
    difficulty: "Medium",
    topic: "Dynamic Programming",
    statement: "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. All houses at this place are arranged in a circle.",
    constraints: ["1 <= nums.length <= 100", "0 <= nums[i] <= 1000"],
    testCases: [{ input: "[2,3,2]", expectedOutput: "3" }],
    defaultCode: { python: "def solve(nums):\n    pass", javascript: "function solve(nums) {\n    \n}", java: "public int rob(int[] nums) {\n    return 0;\n}", cpp: "int rob(vector<int>& nums) {}" }
  },
  {
    id: "longest-palindromic-substring",
    title: "Longest Palindromic Substring",
    difficulty: "Medium",
    topic: "Dynamic Programming",
    statement: "Given a string `s`, return the longest palindromic substring in `s`.",
    constraints: ["1 <= s.length <= 1000", "s consists of only digits and English letters."],
    testCases: [{ input: "'babad'", expectedOutput: "'bab'" }],
    defaultCode: { python: "def solve(s):\n    pass", javascript: "function solve(s) {\n    \n}", java: "public String longestPalindrome(String s) {\n    return \"\";\n}", cpp: "string longestPalindrome(string s) {}" }
  },
  {
    id: "longest-increasing-subsequence",
    title: "Longest Increasing Subsequence",
    difficulty: "Medium",
    topic: "Dynamic Programming",
    statement: "Given an integer array `nums`, return the length of the longest strictly increasing subsequence.",
    constraints: ["1 <= nums.length <= 2500", "-10^4 <= nums[i] <= 10^4"],
    testCases: [{ input: "[10,9,2,5,3,7,101,18]", expectedOutput: "4" }],
    defaultCode: { python: "def solve(nums):\n    pass", javascript: "function solve(nums) {\n    \n}", java: "public int lengthOfLIS(int[] nums) {\n    return 0;\n}", cpp: "int lengthOfLIS(vector<int>& nums) {}" }
  },
  {
    id: "maximum-product-subarray",
    title: "Maximum Product Subarray",
    difficulty: "Medium",
    topic: "Dynamic Programming",
    statement: "Given an integer array `nums`, find the contiguous subarray within an array (containing at least one number) which has the largest product.",
    constraints: ["1 <= nums.length <= 2 * 10^4", "-10 <= nums[i] <= 10"],
    testCases: [{ input: "[2,3,-2,4]", expectedOutput: "6" }],
    defaultCode: { python: "def solve(nums):\n    pass", javascript: "function solve(nums) {\n    \n}", java: "public int maxProduct(int[] nums) {\n    return 0;\n}", cpp: "int maxProduct(vector<int>& nums) {}" }
  },
  {
    id: "unique-paths",
    title: "Unique Paths",
    difficulty: "Medium",
    topic: "Dynamic Programming",
    statement: "There is a robot on an `m x n` grid. The robot is initially located at the top-left corner. The robot can only move either down or right at any point in time.",
    constraints: ["1 <= m, n <= 100"],
    testCases: [{ input: "3, 7", expectedOutput: "28" }],
    defaultCode: { python: "def solve(m, n):\n    pass", javascript: "function solve(m, n) {\n    \n}", java: "public int uniquePaths(int m, int n) {\n    return 0;\n}", cpp: "int uniquePaths(int m, int n) {}" }
  },
  {
    id: "edit-distance",
    title: "Edit Distance",
    difficulty: "Hard",
    topic: "Dynamic Programming",
    statement: "Given two strings `word1` and `word2`, return the minimum number of operations required to convert `word1` to `word2`.",
    constraints: ["0 <= word1.length, word2.length <= 500", "word1 and word2 consist of lowercase English letters."],
    testCases: [{ input: "'horse', 'ros'", expectedOutput: "3" }],
    defaultCode: { python: "def solve(word1, word2):\n    pass", javascript: "function solve(word1, word2) {\n    \n}", java: "public int minDistance(String word1, String word2) {\n    return 0;\n}", cpp: "int minDistance(string word1, string word2) {}" }
  },
  {
    id: "jump-game-ii",
    title: "Jump Game II",
    difficulty: "Medium",
    topic: "Greedy",
    statement: "Given an array of non-negative integers `nums`, you are initially positioned at the first index of the array. Each element in the array represents your maximum jump length at that position. Your goal is to reach the last index in the minimum number of jumps.",
    constraints: ["1 <= nums.length <= 10^4", "0 <= nums[i] <= 1000"],
    testCases: [{ input: "[2,3,1,1,4]", expectedOutput: "2" }],
    defaultCode: { python: "def solve(nums):\n    pass", javascript: "function solve(nums) {\n    \n}", java: "public int jump(int[] nums) {\n    return 0;\n}", cpp: "int jump(vector<int>& nums) {}" }
  },
  {
    id: "partition-labels",
    title: "Partition Labels",
    difficulty: "Medium",
    topic: "Greedy",
    statement: "You are given a string `s`. We want to partition the string into as many parts as possible so that each letter appears in at most one part. Return a list of integers representing the size of these parts.",
    constraints: ["1 <= s.length <= 500", "s consists of lowercase English letters."],
    testCases: [{ input: "'ababcbacadefegdehijhklij'", expectedOutput: "[9,7,8]" }],
    defaultCode: { python: "def solve(s):\n    pass", javascript: "function solve(s) {\n    \n}", java: "public List<Integer> partitionLabels(String s) {\n    return null;\n}", cpp: "vector<int> partitionLabels(string s) {}" }
  },
  {
    id: "meeting-rooms-ii",
    title: "Meeting Rooms II",
    difficulty: "Medium",
    topic: "Greedy",
    statement: "Given an array of meeting time intervals `intervals` where `intervals[i] = [starti, endi]`, return the minimum number of conference rooms required.",
    constraints: ["1 <= intervals.length <= 10^4", "0 <= starti, endi <= 10^6"],
    testCases: [{ input: "[[0,30],[5,10],[15,20]]", expectedOutput: "2" }],
    defaultCode: { python: "def solve(intervals):\n    pass", javascript: "function solve(intervals) {\n    \n}", java: "public int minMeetingRooms(int[][] intervals) {\n    return 0;\n}", cpp: "int minMeetingRooms(vector<vector<int>>& intervals) {}" }
  },
  {
    id: "climbing-stairs-cost",
    title: "Min Cost Climbing Stairs",
    difficulty: "Easy",
    topic: "Dynamic Programming",
    statement: "You are given an integer array cost where cost[i] is the cost of i-th step on a staircase. Once you pay the cost, you can either climb one or two steps.",
    constraints: ["2 <= cost.length <= 1000", "0 <= cost[i] <= 999"],
    testCases: [{ input: "[10,15,20]", expectedOutput: "15" }],
    defaultCode: { python: "def solve(cost):\n    pass", javascript: "function solve(cost) {\n    \n}", java: "public int minCostClimbingStairs(int[] cost) {\n    return 0;\n}", cpp: "int minCostClimbingStairs(vector<int>& cost) {}" }
  },
  {
    id: "unique-paths-ii",
    title: "Unique Paths II",
    difficulty: "Medium",
    topic: "Dynamic Programming",
    statement: "You are given an m x n integer array grid. There is a robot initially located at the top-left corner. The robot tries to move to the bottom-right corner. Now consider if some obstacles are added to the grids.",
    constraints: ["m == obstacleGrid.length", "n == obstacleGrid[i].length", "1 <= m, n <= 100"],
    testCases: [{ input: "[[0,0,0],[0,1,0],[0,0,0]]", expectedOutput: "2" }],
    defaultCode: { python: "def solve(grid):\n    pass", javascript: "function solve(grid) {\n    \n}", java: "public int uniquePathsWithObstacles(int[][] obstacleGrid) {\n    return 0;\n}", cpp: "int uniquePathsWithObstacles(vector<vector<int>>& obstacleGrid) {}" }
  },
  {
    id: "partition-equal-subset-sum",
    title: "Partition Equal Subset Sum",
    difficulty: "Medium",
    topic: "Dynamic Programming",
    statement: "Given a non-empty array nums containing only positive integers, find if the array can be partitioned into two subsets such that the sum of elements in both subsets is equal.",
    constraints: ["1 <= nums.length <= 200", "1 <= nums[i] <= 100"],
    testCases: [{ input: "[1,5,11,5]", expectedOutput: "true" }],
    defaultCode: { python: "def solve(nums):\n    pass", javascript: "function solve(nums) {\n    \n}", java: "public boolean canPartition(int[] nums) {\n    return false;\n}", cpp: "bool canPartition(vector<int>& nums) {}" }
  },
  {
    id: "rotate-image",
    title: "Rotate Image",
    difficulty: "Medium",
    topic: "Matrix",
    statement: "You are given an n x n 2D matrix representing an image, rotate the image by 90 degrees (clockwise).",
    constraints: ["matrix.length == n", "matrix[i].length == n", "1 <= n <= 20"],
    testCases: [{ input: "[[1,2,3],[4,5,6],[7,8,9]]", expectedOutput: "[[7,4,1],[8,5,2],[9,6,3]]" }],
    defaultCode: { python: "def solve(matrix):\n    pass", javascript: "function solve(matrix) {\n    \n}", java: "public void rotate(int[][] matrix) {\n    \n}", cpp: "void rotate(vector<vector<int>>& matrix) {}" }
  },
  {
    id: "set-matrix-zeroes",
    title: "Set Matrix Zeroes",
    difficulty: "Medium",
    topic: "Matrix",
    statement: "Given an m x n integer matrix matrix, if an element is 0, set its entire row and column to 0. Do it in-place.",
    constraints: ["m == matrix.length", "n == matrix[0].length", "1 <= m, n <= 200"],
    testCases: [{ input: "[[1,1,1],[1,0,1],[1,1,1]]", expectedOutput: "[[1,0,1],[0,0,0],[1,0,1]]" }],
    defaultCode: { python: "def solve(matrix):\n    pass", javascript: "function solve(matrix) {\n    \n}", java: "public void setZeroes(int[][] matrix) {\n    \n}", cpp: "void setZeroes(vector<vector<int>>& matrix) {}" }
  },
  {
    id: "spiral-matrix",
    title: "Spiral Matrix",
    difficulty: "Medium",
    topic: "Matrix",
    statement: "Given an m x n matrix, return all elements of the matrix in spiral order.",
    constraints: ["m == matrix.length", "n == matrix[i].length", "1 <= m, n <= 10"],
    testCases: [{ input: "[[1,2,3],[4,5,6],[7,8,9]]", expectedOutput: "[1,2,3,6,9,8,7,4,5]" }],
    defaultCode: { python: "def solve(matrix):\n    pass", javascript: "function solve(matrix) {\n    \n}", java: "public List<Integer> spiralOrder(int[][] matrix) {\n    return null;\n}", cpp: "vector<int> spiralOrder(vector<vector<int>>& matrix) {}" }
  },
  {
    id: "longest-valid-parentheses",
    title: "Longest Valid Parentheses",
    difficulty: "Hard",
    topic: "Stack",
    statement: "Given a string containing just the characters '(' and ')', find the length of the longest valid (well-formed) parentheses substring.",
    constraints: ["0 <= s.length <= 3 * 10^4"],
    testCases: [{ input: "')()())'", expectedOutput: "4" }],
    defaultCode: { python: "def solve(s):\n    pass", javascript: "function solve(s) {\n    \n}", java: "public int longestValidParentheses(String s) {\n    return 0;\n}", cpp: "int longestValidParentheses(string s) {}" }
  },
  {
    id: "largest-rectangle-histogram",
    title: "Largest Rectangle in Histogram",
    difficulty: "Hard",
    topic: "Stack",
    statement: "Given an array of integers heights representing the histogram's bar height where the width of each bar is 1, find the area of the largest rectangle in the histogram.",
    constraints: ["1 <= heights.length <= 10^5", "0 <= heights[i] <= 10^4"],
    testCases: [{ input: "[2,1,5,6,2,3]", expectedOutput: "10" }],
    defaultCode: { python: "def solve(heights):\n    pass", javascript: "function solve(heights) {\n    \n}", java: "public int largestRectangleArea(int[] heights) {\n    return 0;\n}", cpp: "int largestRectangleArea(vector<int>& heights) {}" }
  },
  {
    id: "trapping-rain-water-ii",
    title: "Trapping Rain Water II",
    difficulty: "Hard",
    topic: "Heap",
    statement: "Given an m x n integer matrix heightMap representing the height of each unit cell in a 2D elevation map, return the volume of water it can trap after raining.",
    constraints: ["m == heightMap.length", "n == heightMap[i].length", "1 <= m, n <= 200"],
    testCases: [{ input: "[[1,4,3,1,3,2],[3,2,1,3,2,4],[2,3,3,2,3,1]]", expectedOutput: "4" }],
    defaultCode: { python: "def solve(heightMap):\n    pass", javascript: "function solve(heightMap) {\n    \n}", java: "public int trapRainWater(int[][] heightMap) {\n    return 0;\n}", cpp: "int trapRainWater(vector<vector<int>>& heightMap) {}" }
  },
  {
    id: "sort-characters-by-frequency",
    title: "Sort Characters By Frequency",
    difficulty: "Medium",
    topic: "Heap",
    statement: "Given a string s, sort it in decreasing order based on the frequency of the characters. The frequency of a character is the number of times it appears in the string.",
    constraints: ["1 <= s.length <= 5 * 10^5", "s consists of uppercase and lowercase English letters and digits."],
    testCases: [{ input: "'tree'", expectedOutput: "'eert'" }],
    defaultCode: { python: "def solve(s):\n    pass", javascript: "function solve(s) {\n    \n}", java: "public String frequencySort(String s) {\n    return \"\";\n}", cpp: "string frequencySort(string s) {}" }
  },
  {
    id: "kth-largest-element-stream",
    title: "Kth Largest Element in a Stream",
    difficulty: "Easy",
    topic: "Heap",
    statement: "Design a class to find the kth largest element in a stream. Note that it is the kth largest element in the sorted order, not the kth distinct element.",
    constraints: ["1 <= k <= 10^4", "0 <= nums.length <= 10^4"],
    testCases: [{ input: "k=3, nums=[4,5,8,2], add(3), add(5), add(10)", expectedOutput: "4, 5, 5" }],
    defaultCode: { python: "class KthLargest:\n    def __init__(self, k, nums):\n        pass", javascript: "var KthLargest = function(k, nums) {};", java: "class KthLargest { public KthLargest(int k, int[] nums) {} }", cpp: "class KthLargest { public: KthLargest(int k, vector<int>& nums) {} };" }
  },
  {
    id: "reorganize-string",
    title: "Reorganize String",
    difficulty: "Medium",
    topic: "Greedy",
    statement: "Given a string s, rearrange the characters of s so that any two adjacent characters are not the same.",
    constraints: ["1 <= s.length <= 500", "s consists of lowercase English letters."],
    testCases: [{ input: "'aab'", expectedOutput: "'aba'" }],
    defaultCode: { python: "def solve(s):\n    pass", javascript: "function solve(s) {\n    \n}", java: "public String reorganizeString(String s) {\n    return \"\";\n}", cpp: "string reorganizeString(string s) {}" }
  },
  {
    id: "hand-of-straights",
    title: "Hand of Straights",
    difficulty: "Medium",
    topic: "Greedy",
    statement: "Alice has some number of cards and she wants to rearrange the cards into groups so that each group is of size groupSize, and consists of groupSize consecutive cards.",
    constraints: ["1 <= hand.length <= 10^4", "1 <= groupSize <= hand.length"],
    testCases: [{ input: "[1,2,3,6,2,3,4,7,8], 3", expectedOutput: "true" }],
    defaultCode: { python: "def solve(hand, groupSize):\n    pass", javascript: "function solve(hand, groupSize) {\n    \n}", java: "public boolean isNStraightHand(int[] hand, int groupSize) {\n    return false;\n}", cpp: "bool isNStraightHand(vector<int>& hand, int groupSize) {}" }
  },
  {
    id: "next-greater-element-i",
    title: "Next Greater Element I",
    difficulty: "Easy",
    topic: "Stack",
    statement: "The next greater element of some element x in an array is the first greater element that is to the right of x in the same array.",
    constraints: ["1 <= nums1.length <= nums2.length <= 1000", "0 <= nums1[i], nums2[i] <= 10^4"],
    testCases: [{ input: "[4,1,2], [1,3,4,2]", expectedOutput: "[-1,3,-1]" }],
    defaultCode: { python: "def solve(nums1, nums2):\n    pass", javascript: "function solve(nums1, nums2) {\n    \n}", java: "public int[] nextGreaterElement(int[] nums1, int[] nums2) {\n    return new int[]{};\n}", cpp: "vector<int> nextGreaterElement(vector<int>& nums1, vector<int>& nums2) {}" }
  },
  {
    id: "circular-queue-design",
    title: "Design Circular Queue",
    difficulty: "Medium",
    topic: "Simulation",
    statement: "Design your implementation of the circular queue. The circular queue is a linear data structure in which the operations are performed based on FIFO (First In First Out) principle.",
    constraints: ["1 <= k <= 1000", "0 <= value <= 1000"],
    testCases: [{ input: "MyCircularQueue(3), enQueue(1), enQueue(2), enQueue(3), enQueue(4), Rear(), isFull(), deQueue(), enQueue(4), Rear()", expectedOutput: "true, true, true, false, 3, true, true, true, 4" }],
    defaultCode: { python: "class MyCircularQueue:\n    def __init__(self, k):\n        pass", javascript: "var MyCircularQueue = function(k) {};", java: "class MyCircularQueue { public MyCircularQueue(int k) {} }", cpp: "class MyCircularQueue { public: MyCircularQueue(int k) {} };" }
  },
  {
    id: "flatten-binary-tree-linked-list",
    title: "Flatten Binary Tree to Linked List",
    difficulty: "Medium",
    topic: "Binary Tree",
    statement: "Given the root of a binary tree, flatten the tree into a 'linked list': The 'linked list' should use the same TreeNode class where the right child pointer points to the next node in the list and the left child pointer is always null.",
    constraints: ["The number of nodes in the tree is in the range [0, 2000].", "-100 <= Node.val <= 100"],
    testCases: [{ input: "[1,2,5,3,4,null,6]", expectedOutput: "[1,null,2,null,3,null,4,null,5,null,6]" }],
    defaultCode: { python: "def solve(root):\n    pass", javascript: "function solve(root) {\n    \n}", java: "public void flatten(TreeNode root) {\n    \n}", cpp: "void flatten(TreeNode* root) {}" }
  },
  {
    id: "sum-root-to-leaf-numbers",
    title: "Sum Root to Leaf Numbers",
    difficulty: "Medium",
    topic: "Binary Tree",
    statement: "You are given the root of a binary tree containing digits from 0 to 9 only. Each root-to-leaf path in the tree represents a number.",
    constraints: ["The number of nodes in the tree is in the range [1, 1000].", "0 <= Node.val <= 9"],
    testCases: [{ input: "[1,2,3]", expectedOutput: "25" }],
    defaultCode: { python: "def solve(root):\n    pass", javascript: "function solve(root) {\n    \n}", java: "public int sumNumbers(TreeNode root) {\n    return 0;\n}", cpp: "int sumNumbers(TreeNode* root) {}" }
  },
  {
    id: "populating-next-right-pointers",
    title: "Populating Next Right Pointers in Each Node",
    difficulty: "Medium",
    topic: "Binary Tree",
    statement: "You are given a perfect binary tree where all leaves are on the same level, and every parent has two children. Populate each next pointer to point to its next right node. If there is no next right node, the next pointer should be set to NULL.",
    constraints: ["The number of nodes in the tree is in the range [0, 2^12 - 1].", "-1000 <= Node.val <= 1000"],
    testCases: [{ input: "[1,2,3,4,5,6,7]", expectedOutput: "[1,#,2,3,#,4,5,6,7,#]" }],
    defaultCode: { python: "def solve(root):\n    pass", javascript: "function solve(root) {\n    \n}", java: "public Node connect(Node root) {\n    return null;\n}", cpp: "Node* connect(Node* root) {}" }
  },
  {
    id: "validate-binary-search-tree",
    title: "Validate Binary Search Tree",
    difficulty: "Medium",
    topic: "Binary Search",
    statement: "Given the root of a binary tree, determine if it is a valid binary search tree (BST).",
    constraints: ["The number of nodes in the tree is in the range [1, 10^4].", "-2^31 <= Node.val <= 2^31 - 1"],
    testCases: [{ input: "[2,1,3]", expectedOutput: "true" }],
    defaultCode: { python: "def solve(root):\n    pass", javascript: "function solve(root) {\n    \n}", java: "public boolean isValidBST(TreeNode root) {\n    return false;\n}", cpp: "bool isValidBST(TreeNode* root) {}" }
  },
  {
    id: "search-in-bst",
    title: "Search in a Binary Search Tree",
    difficulty: "Easy",
    topic: "Binary Search",
    statement: "You are given the root of a binary search tree (BST) and an integer val. Find the node in the BST that the node's value equals val and return the subtree rooted with that node.",
    constraints: ["The number of nodes in the tree is in the range [1, 5000].", "1 <= Node.val <= 10^7"],
    testCases: [{ input: "[4,2,7,1,3], 2", expectedOutput: "[2,1,3]" }],
    defaultCode: { python: "def solve(root, val):\n    pass", javascript: "function solve(root, val) {\n    \n}", java: "public TreeNode searchBST(TreeNode root, int val) {\n    return null;\n}", cpp: "TreeNode* searchBST(TreeNode* root, int val) {}" }
  },
  {
    id: "binary-tree-paths",
    title: "Binary Tree Paths",
    difficulty: "Easy",
    topic: "Recursion",
    statement: "Given the root of a binary tree, return all root-to-leaf paths in any order.",
    constraints: ["The number of nodes in the tree is in the range [1, 100].", "-100 <= Node.val <= 100"],
    testCases: [{ input: "[1,2,3,null,5]", expectedOutput: "['1->2->5','1->3']" }],
    defaultCode: { python: "def solve(root):\n    pass", javascript: "function solve(root) {\n    \n}", java: "public List<String> binaryTreePaths(TreeNode root) {\n    return null;\n}", cpp: "vector<string> binaryTreePaths(TreeNode* root) {}" }
  },
  {
    id: "combinations",
    title: "Combinations",
    difficulty: "Medium",
    topic: "Recursion",
    statement: "Given two integers n and k, return all possible combinations of k numbers chosen from the range [1, n].",
    constraints: ["1 <= n <= 20", "1 <= k <= n"],
    testCases: [{ input: "4, 2", expectedOutput: "[[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]" }],
    defaultCode: { python: "def solve(n, k):\n    pass", javascript: "function solve(n, k) {\n    \n}", java: "public List<List<Integer>> combine(int n, int k) {\n    return null;\n}", cpp: "vector<vector<int>> combine(int n, int k) {}" }
  },
  {
    id: "letter-combinations-phone-number",
    title: "Letter Combinations of a Phone Number",
    difficulty: "Medium",
    topic: "Recursion",
    statement: "Given a string containing digits from 2-9 inclusive, return all possible letter combinations that the number could represent. Return the answer in any order.",
    constraints: ["0 <= digits.length <= 4", "digits[i] is a digit in the range ['2', '9']."],
    testCases: [{ input: "'23'", expectedOutput: "['ad','ae','af','bd','be','bf','cd','ce','cf']" }],
    defaultCode: { python: "def solve(digits):\n    pass", javascript: "function solve(digits) {\n    \n}", java: "public List<String> letterCombinations(String digits) {\n    return null;\n}", cpp: "vector<string> letterCombinations(string digits) {}" }
  },
  {
    id: "subsets",
    title: "Subsets",
    difficulty: "Medium",
    topic: "Recursion",
    statement: "Given an integer array nums of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets.",
    constraints: ["1 <= nums.length <= 10", "-10 <= nums[i] <= 10"],
    testCases: [{ input: "[1,2,3]", expectedOutput: "[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]" }],
    defaultCode: { python: "def solve(nums):\n    pass", javascript: "function solve(nums) {\n    \n}", java: "public List<List<Integer>> subsets(int[] nums) {\n    return null;\n}", cpp: "vector<vector<int>> subsets(vector<int>& nums) {}" }
  },
  {
    id: "restore-ip-addresses",
    title: "Restore IP Addresses",
    difficulty: "Medium",
    topic: "Recursion",
    statement: "A valid IP address consists of exactly four integers separated by single dots. Each integer is between 0 and 255 (inclusive) and cannot have leading zeros. Given a string s containing only digits, return all possible valid IP addresses that can be formed by inserting dots into s.",
    constraints: ["1 <= s.length <= 20", "s consists of digits only."],
    testCases: [{ input: "'25525511135'", expectedOutput: "['255.255.11.135','255.255.111.35']" }],
    defaultCode: { python: "def solve(s):\n    pass", javascript: "function solve(s) {\n    \n}", java: "public List<String> restoreIpAddresses(String s) {\n    return null;\n}", cpp: "vector<string> restoreIpAddresses(string s) {}" }
  },
  {
    id: "n-queens",
    title: "N-Queens",
    difficulty: "Hard",
    topic: "Recursion",
    statement: "The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other. Given an integer n, return all distinct solutions to the n-queens puzzle.",
    constraints: ["1 <= n <= 9"],
    testCases: [{ input: "4", expectedOutput: "[['.Q..','...Q','Q...','..Q.'],['..Q.','Q...','...Q','.Q..']]" }],
    defaultCode: { python: "def solve(n):\n    pass", javascript: "function solve(n) {\n    \n}", java: "public List<List<String>> solveNQueens(int n) {\n    return null;\n}", cpp: "vector<vector<string>> solveNQueens(int n) {}" }
  },
  {
    id: "hamiltonian-cycle",
    title: "Hamiltonian Cycle",
    difficulty: "Hard",
    topic: "Graph Theory",
    statement: "Find a Hamiltonian Cycle in the given graph. A Hamiltonian Path in an undirected graph is a path that visits each vertex exactly once. A Hamiltonian Cycle is a Hamiltonian Path such that there is an edge from the last vertex to the first vertex.",
    constraints: ["V <= 10"],
    testCases: [{ input: "adjacency matrix", expectedOutput: "[0, 1, 2, 4, 3, 0]" }],
    defaultCode: { python: "def solve(graph):\n    pass", javascript: "function solve(graph) {\n    \n}", java: "public int[] findHamiltonianCycle(int[][] graph) {\n    return null;\n}", cpp: "vector<int> hamiltonianCycle(vector<vector<int>>& graph) {}" }
  },
  {
    id: "min-spanning-tree-prim",
    title: "Minimum Spanning Tree (Prim's Algorithm)",
    difficulty: "Medium",
    topic: "Graph Theory",
    statement: "Given a weighted, undirected, and connected graph of V vertices and E edges. Find the sum of weights of the edges of the Minimum Spanning Tree.",
    constraints: ["1 <= V, E <= 10^3"],
    testCases: [{ input: "V=3, edges=[[0,1,5],[1,2,3],[0,2,1]]", expectedOutput: "4" }],
    defaultCode: { python: "def solve(V, adj):\n    pass", javascript: "function solve(V, adj) {\n    \n}", java: "public int spanningTree(int V, int[][] adj) {\n    return 0;\n}", cpp: "int spanningTree(int V, vector<vector<int>> adj[]) {}" }
  },
  {
    id: "min-spanning-tree-kruskal",
    title: "Minimum Spanning Tree (Kruskal's Algorithm)",
    difficulty: "Medium",
    topic: "Graph Theory",
    statement: "Given a weighted, undirected, and connected graph. Find the sum of weights of the edges of the Minimum Spanning Tree using Kruskal's Algorithm.",
    constraints: ["1 <= V, E <= 10^3"],
    testCases: [{ input: "V=3, edges=[[0,1,5],[1,2,3],[0,2,1]]", expectedOutput: "4" }],
    defaultCode: { python: "def solve(V, edges):\n    pass", javascript: "function solve(V, edges) {\n    \n}", java: "public int kruskalMST(int V, int[][] edges) {\n    return 0;\n}", cpp: "int kruskalMST(int V, vector<vector<int>>& edges) {}" }
  },
  {
    id: "shortest-path-dijkstra",
    title: "Shortest Path (Dijkstra's Algorithm)",
    difficulty: "Medium",
    topic: "Graph Theory",
    statement: "Given a weighted, undirected and connected graph of V vertices and an adjacency list. Find the shortest distance from the source vertex S to all other vertices in the graph.",
    constraints: ["1 <= V, E <= 10^3"],
    testCases: [{ input: "V=2, adj=[[[1,9]], [[0,9]]], S=0", expectedOutput: "[0,9]" }],
    defaultCode: { python: "def solve(V, adj, S):\n    pass", javascript: "function solve(V, adj, S) {\n    \n}", java: "public int[] dijkstra(int V, ArrayList<ArrayList<ArrayList<Integer>>> adj, int S) {\n    return null;\n}", cpp: "vector<int> dijkstra(int V, vector<vector<int>> adj[], int S) {}" }
  },
  {
    id: "shortest-path-bellman-ford",
    title: "Shortest Path (Bellman-Ford Algorithm)",
    difficulty: "Medium",
    topic: "Graph Theory",
    statement: "Given a weighted, directed graph with V vertices and E edges. Find the shortest distance from the source vertex S to all other vertices. If the graph contains a negative weight cycle, return -1.",
    constraints: ["1 <= V, E <= 100"],
    testCases: [{ input: "V=2, edges=[[0,1,9]], S=0", expectedOutput: "[0,9]" }],
    defaultCode: { python: "def solve(V, edges, S):\n    pass", javascript: "function solve(V, edges, S) {\n    \n}", java: "public int[] bellmanFord(int V, int[][] edges, int S) {\n    return null;\n}", cpp: "vector<int> bellmanFord(int V, vector<vector<int>>& edges, int S) {}" }
  },
  {
    id: "all-pairs-shortest-path-floyd",
    title: "All Pairs Shortest Path (Floyd-Warshall)",
    difficulty: "Medium",
    topic: "Graph Theory",
    statement: "The problem is to find the shortest distances between every pair of vertices in a given edge-weighted directed graph.",
    constraints: ["V <= 100"],
    testCases: [{ input: "[[0,1,43],[1,0,6],...]", expectedOutput: "min distances matrix" }],
    defaultCode: { python: "def solve(matrix):\n    pass", javascript: "function solve(matrix) {\n    \n}", java: "public void floydWarshall(int[][] matrix) {\n    \n}", cpp: "void shortest_distance(vector<vector<int>>&matrix) {}" }
  },
  {
    id: "topological-sort-bfs",
    title: "Topological Sort (Kahn's Algorithm)",
    difficulty: "Medium",
    topic: "Graph Theory",
    statement: "Given a Directed Acyclic Graph (DAG) with V vertices and E edges, Find any Topological Sorting of that graph using BFS (Kahn's Algorithm).",
    constraints: ["1 <= V, E <= 10^4"],
    testCases: [{ input: "V=3, adj=[[1,2],[2],[]]", expectedOutput: "[0,1,2]" }],
    defaultCode: { python: "def solve(V, adj):\n    pass", javascript: "function solve(V, adj) {\n    \n}", java: "public int[] topoSort(int V, ArrayList<ArrayList<Integer>> adj) {\n    return null;\n}", cpp: "vector<int> topoSort(int V, vector<int> adj[]) {}" }
  },
  {
    id: "strongly-connected-komaraju",
    title: "Strongly Connected Components (Kosaraju's Algorithm)",
    difficulty: "Hard",
    topic: "Graph Theory",
    statement: "Given a Directed Graph with V vertices and E edges, Find the number of strongly connected components in the graph.",
    constraints: ["1 <= V, E <= 10^3"],
    testCases: [{ input: "V=5, adj=[[1],[2],[0],[4],[]]", expectedOutput: "3" }],
    defaultCode: { python: "def solve(V, adj):\n    pass", javascript: "function solve(V, adj) {\n    \n}", java: "public int kosaraju(int V, ArrayList<ArrayList<Integer>> adj) {\n    return 0;\n}", cpp: "int kosaraju(int V, vector<vector<int>>& adj) {}" }
  },
  {
    id: "articulation-points-graph",
    title: "Articulation Points in a Graph",
    difficulty: "Hard",
    topic: "Graph Theory",
    statement: "Given an undirected connected graph with V vertices and E edges, find all the articulation points in the graph.",
    constraints: ["1 <= V, E <= 10^3"],
    testCases: [{ input: "V=5, adj=[[1,0],[0,2],[2,1],[0,3],[3,4]]", expectedOutput: "[0,3]" }],
    defaultCode: { python: "def solve(V, adj):\n    pass", javascript: "function solve(V, adj) {\n    \n}", java: "public ArrayList<Integer> articulationPoints(int V, ArrayList<ArrayList<Integer>> adj) {\n    return null;\n}", cpp: "vector<int> articulationPoints(int V, vector<int>adj[]) {}" }
  },
  {
    id: "bridges-in-graph",
    title: "Bridges in a Graph",
    difficulty: "Hard",
    topic: "Graph Theory",
    statement: "Given an undirected graph with V vertices and E edges, find all the bridges in the graph. An edge in an undirected connected graph is a bridge if removing it disconnects the graph.",
    constraints: ["1 <= V, E <= 10^3"],
    testCases: [{ input: "n=4, edges=[[0,1],[1,2],[2,0],[1,3]]", expectedOutput: "[[1,3]]" }],
    defaultCode: { python: "def solve(n, connections):\n    pass", javascript: "function solve(n, connections) {\n    \n}", java: "public List<List<Integer>> criticalConnections(int n, List<List<Integer>> connections) {\n    return null;\n}", cpp: "vector<vector<int>> criticalConnections(int n, vector<vector<int>>& connections) {}" }
  },
  {
    id: "snakes-and-ladders",
    title: "Snakes and Ladders",
    difficulty: "Medium",
    topic: "Breadth-First Search",
    statement: "You are given an n x n integer matrix board where the cells are labeled from 1 to n^2 in a Boustrophedon style starting from the bottom left of the board (i.e. board[n-1][0]) and alternating direction each row.",
    constraints: ["n == board.length", "n == board[i].length", "2 <= n <= 20"],
    testCases: [{ input: "board=[[-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1],[-1,35,-1,-1,13,-1],[-1,-1,-1,-1,-1,-1],[-1,15,-1,-1,-1,-1]]", expectedOutput: "4" }],
    defaultCode: { python: "def solve(board):\n    pass", javascript: "function solve(board) {\n    \n}", java: "public int snakesAndLadders(int[][] board) {\n    return 0;\n}", cpp: "int snakesAndLadders(vector<vector<int>>& board) {}" }
  },
  {
    id: "rotting-oranges",
    title: "Rotting Oranges",
    difficulty: "Medium",
    topic: "Breadth-First Search",
    statement: "You are given an m x n grid where each cell can have one of three values: 0 representing an empty cell, 1 representing a fresh orange, or 2 representing a rotten orange. Return the minimum number of minutes that must elapse until no cell has a fresh orange.",
    constraints: ["m == grid.length", "n == grid[i].length", "1 <= m, n <= 10"],
    testCases: [{ input: "[[2,1,1],[1,1,0],[0,1,1]]", expectedOutput: "4" }],
    defaultCode: { python: "def solve(grid):\n    pass", javascript: "function solve(grid) {\n    \n}", java: "public int orangesRotting(int[][] grid) {\n    return 0;\n}", cpp: "int orangesRotting(vector<vector<int>>& grid) {}" }
  },
  {
    id: "shortest-bridge",
    title: "Shortest Bridge",
    difficulty: "Medium",
    topic: "Breadth-First Search",
    statement: "You are given an n x n binary matrix grid where 1 represents land and 0 represents water. An island is a 4-directionally connected group of 1's not connected to any other 1's. There are exactly two islands in grid.",
    constraints: ["n == grid.length", "n == grid[i].length", "2 <= n <= 100"],
    testCases: [{ input: "[[0,1,0],[0,0,0],[0,0,1]]", expectedOutput: "2" }],
    defaultCode: { python: "def solve(grid):\n    pass", javascript: "function solve(grid) {\n    \n}", java: "public int shortestBridge(int[][] grid) {\n    return 0;\n}", cpp: "int shortestBridge(vector<vector<int>>& grid) {}" }
  },
  {
    id: "as-far-from-land-as-possible",
    title: "As Far from Land as Possible",
    difficulty: "Medium",
    topic: "Breadth-First Search",
    statement: "Given an n x n grid containing only values 0 and 1, where 0 represents water and 1 represents land, find a water cell such that its distance to the nearest land cell is maximized, and return the distance.",
    constraints: ["n == grid.length", "n == grid[i].length", "1 <= n <= 100"],
    testCases: [{ input: "[[1,0,1],[0,0,0],[1,0,1]]", expectedOutput: "2" }],
    defaultCode: { python: "def solve(grid):\n    pass", javascript: "function solve(grid) {\n    \n}", java: "public int maxDistance(int[][] grid) {\n    return 0;\n}", cpp: "int maxDistance(vector<vector<int>>& grid) {}" }
  },
  {
    id: "reverse-bits",
    title: "Reverse Bits",
    difficulty: "Easy",
    topic: "Bit Manipulation",
    statement: "Reverse bits of a given 32 bits unsigned integer.",
    constraints: ["The input must be a binary string of length 32"],
    testCases: [{ input: "00000010100101000001111010011100", expectedOutput: "00111001011110000010100101000000" }],
    defaultCode: { python: "def solve(n):\n    pass", javascript: "function solve(n) {\n    \n}", java: "public int reverseBits(int n) {\n    return 0;\n}", cpp: "uint32_t reverseBits(uint32_t n) {}" }
  },
  {
    id: "number-of-1-bits",
    title: "Number of 1 Bits",
    difficulty: "Easy",
    topic: "Bit Manipulation",
    statement: "Write a function that takes an unsigned integer and returns the number of '1' bits it has (also known as the Hamming weight).",
    constraints: ["The input must be a binary string of length 32"],
    testCases: [{ input: "11", expectedOutput: "3" }],
    defaultCode: { python: "def solve(n):\n    pass", javascript: "function solve(n) {\n    \n}", java: "public int hammingWeight(int n) {\n    return 0;\n}", cpp: "int hammingWeight(uint32_t n) {}" }
  },
  {
    id: "missing-number",
    title: "Missing Number",
    difficulty: "Easy",
    topic: "Bit Manipulation",
    statement: "Given an array nums containing n distinct numbers in the range [0, n], return the only number in the range that is missing from the array.",
    constraints: ["n == nums.length", "1 <= n <= 10^4", "0 <= nums[i] <= n"],
    testCases: [{ input: "[3,0,1]", expectedOutput: "2" }],
    defaultCode: { python: "def solve(nums):\n    pass", javascript: "function solve(nums) {\n    \n}", java: "public int missingNumber(int[] nums) {\n    return 0;\n}", cpp: "int missingNumber(vector<int>& nums) {}" }
  },
  {
    id: "power-of-two",
    title: "Power of Two",
    difficulty: "Easy",
    topic: "Bit Manipulation",
    statement: "Given an integer n, return true if it is a power of two. Otherwise, return false.",
    constraints: ["-2^31 <= n <= 2^31 - 1"],
    testCases: [{ input: "1", expectedOutput: "true" }],
    defaultCode: { python: "def solve(n):\n    pass", javascript: "function solve(n) {\n    \n}", java: "public boolean isPowerOfTwo(int n) {\n    return false;\n}", cpp: "bool isPowerOfTwo(int n) {}" }
  },
  {
    id: "sum-of-two-integers",
    title: "Sum of Two Integers",
    difficulty: "Medium",
    topic: "Bit Manipulation",
    statement: "Given two integers a and b, return the sum of the two integers without using the operators + and -.",
    constraints: ["-1000 <= a, b <= 1000"],
    testCases: [{ input: "a = 1, b = 2", expectedOutput: "3" }],
    defaultCode: { python: "def solve(a, b):\n    pass", javascript: "function solve(a, b) {\n    \n}", java: "public int getSum(int a, int b) {\n    return 0;\n}", cpp: "int getSum(int a, int b) {}" }
  },
  {
    id: "implement-trie",
    title: "Implement Trie (Prefix Tree)",
    difficulty: "Medium",
    topic: "Trie",
    statement: "A trie (pronounced as \"try\") or prefix tree is a tree data structure used to efficiently store and retrieve keys in a dataset of strings. Implement the Trie class.",
    constraints: ["1 <= word.length, prefix.length <= 2000", "word and prefix consist only of lowercase English letters.", "At most 3 * 10^4 calls in total will be made to insert, search, and startsWith."],
    testCases: [{ input: "[\"Trie\", \"insert\", \"search\", \"search\", \"startsWith\", \"insert\", \"search\"] [[], [\"apple\"], [\"apple\"], [\"app\"], [\"app\"], [\"app\"], [\"app\"]]", expectedOutput: "[null, null, true, false, true, null, true]" }],
    defaultCode: { python: "class Trie:\n    def __init__(self):\n        pass\n    def insert(self, word: str) -> None:\n        pass\n    def search(self, word: str) -> bool:\n        pass\n    def startsWith(self, prefix: str) -> bool:\n        pass", javascript: "var Trie = function() {\n    \n};\nTrie.prototype.insert = function(word) {\n    \n};\nTrie.prototype.search = function(word) {\n    \n};\nTrie.prototype.startsWith = function(prefix) {\n    \n};", java: "class Trie {\n    public Trie() {}\n    public void insert(String word) {}\n    public boolean search(String word) { return false; }\n    public boolean startsWith(String prefix) { return false; }\n}", cpp: "class Trie {\npublic:\n    Trie() {}\n    void insert(string word) {}\n    bool search(string word) {}\n    bool startsWith(string prefix) {}\n};" }
  },
  {
    id: "design-add-and-search-words-data-structure",
    title: "Design Add and Search Words Data Structure",
    difficulty: "Medium",
    topic: "Trie",
    statement: "Design a data structure that supports adding new words and finding if a string matches any previously added string.",
    constraints: ["1 <= word.length <= 25", "word in addWord consists of lowercase English letters.", "word in search consist of '.' or lowercase English letters."],
    testCases: [{ input: "[\"WordDictionary\",\"addWord\",\"addWord\",\"addWord\",\"search\",\"search\",\"search\",\"search\"] [[],[\"bad\"],[\"dad\"],[\"mad\"],[\"pad\"],[\"bad\"],[\".ad\"],[\"b..\"]]", expectedOutput: "[null,null,null,null,false,true,true,true]" }],
    defaultCode: { python: "class WordDictionary:\n    def __init__(self):\n        pass\n    def addWord(self, word: str) -> None:\n        pass\n    def search(self, word: str) -> bool:\n        pass", javascript: "var WordDictionary = function() {\n    \n};\nWordDictionary.prototype.addWord = function(word) {\n    \n};\nWordDictionary.prototype.search = function(word) {\n    \n};", java: "class WordDictionary {\n    public WordDictionary() {}\n    public void addWord(String word) {}\n    public boolean search(String word) { return false; }\n}", cpp: "class WordDictionary {\npublic:\n    WordDictionary() {}\n    void addWord(string word) {}\n    bool search(string word) {}\n};" }
  },
  {
    id: "word-search-ii",
    title: "Word Search II",
    difficulty: "Hard",
    topic: "Trie",
    statement: "Given an m x n board of characters and a list of strings words, return all words on the board.",
    constraints: ["m == board.length", "n == board[i].length", "1 <= m, n <= 12", "1 <= words.length <= 3 * 10^4", "1 <= words[i].length <= 10"],
    testCases: [{ input: "board = [[\"o\",\"a\",\"a\",\"n\"],[\"e\",\"t\",\"a\",\"e\"],[\"i\",\"h\",\"k\",\"r\"],[\"i\",\"f\",\"l\",\"v\"]], words = [\"oath\",\"pea\",\"eat\",\"rain\"]", expectedOutput: "[\"eat\",\"oath\"]" }],
    defaultCode: { python: "def solve(board, words):\n    pass", javascript: "function solve(board, words) {\n    \n}", java: "public List<String> findWords(char[][] board, String[] words) {\n    return null;\n}", cpp: "vector<string> findWords(vector<vector<char>>& board, vector<string>& words) {}" }
  },
  {
    id: "prefix-and-suffix-search",
    title: "Prefix and Suffix Search",
    difficulty: "Hard",
    topic: "Trie",
    statement: "Design a special dictionary that has some words and allows you to search the words in it by a prefix and a suffix.",
    constraints: ["1 <= words.length <= 10^4", "1 <= words[i].length <= 7", "1 <= prefix.length, suffix.length <= 7"],
    testCases: [{ input: "[\"WordFilter\", \"f\"] [[[\"apple\"]], [\"a\", \"e\"]]", expectedOutput: "[null, 0]" }],
    defaultCode: { python: "class WordFilter:\n    def __init__(self, words: List[str]):\n        pass\n    def f(self, prefix: str, suffix: str) -> int:\n        pass", javascript: "var WordFilter = function(words) {\n    \n};\nWordFilter.prototype.f = function(prefix, suffix) {\n    \n};", java: "class WordFilter {\n    public WordFilter(String[] words) {}\n    public int f(String prefix, String suffix) { return -1; }\n}", cpp: "class WordFilter {\npublic:\n    WordFilter(vector<string>& words) {}\n    int f(string prefix, string suffix) {}\n};" }
  },
  {
    id: "longest-word-in-dictionary",
    title: "Longest Word in Dictionary",
    difficulty: "Medium",
    topic: "Trie",
    statement: "Given an array of strings words representing an English Dictionary, return the longest word in words that can be built one character at a time by other words in words.",
    constraints: ["1 <= words.length <= 1000", "1 <= words[i].length <= 30"],
    testCases: [{ input: "[\"w\",\"wo\",\"wor\",\"worl\",\"world\"]", expectedOutput: "\"world\"" }],
    defaultCode: { python: "def solve(words):\n    pass", javascript: "function solve(words) {\n    \n}", java: "public String longestWord(String[] words) {\n    return \"\";\n}", cpp: "string longestWord(vector<string>& words) {}" }
  },
  {
    id: "maximum-xor-of-two-numbers-in-an-array",
    title: "Maximum XOR of Two Numbers in an Array",
    difficulty: "Medium",
    topic: "Trie",
    statement: "Given an integer array nums, return the maximum result of nums[i] XOR nums[j], where 0 <= i <= j < n.",
    constraints: ["1 <= nums.length <= 2 * 10^5", "0 <= nums[i] <= 2^31 - 1"],
    testCases: [{ input: "[3,10,5,25,2,8]", expectedOutput: "28" }],
    defaultCode: { python: "def solve(nums):\n    pass", javascript: "function solve(nums) {\n    \n}", java: "public int findMaximumXOR(int[] nums) {\n    return 0;\n}", cpp: "int findMaximumXOR(vector<int>& nums) {}" }
  },
  {
    id: "kth-largest-element-in-an-array",
    title: "Kth Largest Element in an Array",
    difficulty: "Medium",
    topic: "Heap",
    statement: "Given an integer array nums and an integer k, return the kth largest element in the array.",
    constraints: ["1 <= k <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    testCases: [{ input: "nums = [3,2,1,5,6,4], k = 2", expectedOutput: "5" }],
    defaultCode: { python: "def solve(nums, k):\n    pass", javascript: "function solve(nums, k) {\n    \n}", java: "public int findKthLargest(int[] nums, int k) {\n    return 0;\n}", cpp: "int findKthLargest(vector<int>& nums, int k) {}" }
  },
  {
    id: "top-k-frequent-elements",
    title: "Top K Frequent Elements",
    difficulty: "Medium",
    topic: "Heap",
    statement: "Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.",
    constraints: ["1 <= nums.length <= 10^5", "k is in the range [1, the number of unique elements in the array]."],
    testCases: [{ input: "nums = [1,1,1,2,2,3], k = 2", expectedOutput: "[1,2]" }],
    defaultCode: { python: "def solve(nums, k):\n    pass", javascript: "function solve(nums, k) {\n    \n}", java: "public int[] topKFrequent(int[] nums, int k) {\n    return null;\n}", cpp: "vector<int> topKFrequent(vector<int>& nums, int k) {}" }
  },
  {
    id: "find-median-from-data-stream",
    title: "Find Median from Data Stream",
    difficulty: "Hard",
    topic: "Heap",
    statement: "The median is the middle value in an ordered integer list. Implement the MedianFinder class.",
    constraints: ["-10^5 <= num <= 10^5", "At most 5 * 10^4 calls will be made to addNum and findMedian."],
    testCases: [{ input: "[\"MedianFinder\", \"addNum\", \"addNum\", \"findMedian\", \"addNum\", \"findMedian\"] [[], [1], [2], [], [3], []]", expectedOutput: "[null, null, null, 1.5, null, 2.0]" }],
    defaultCode: { python: "class MedianFinder:\n    def __init__(self):\n        pass\n    def addNum(self, num: int) -> None:\n        pass\n    def findMedian(self) -> float:\n        pass", javascript: "var MedianFinder = function() {\n    \n};\nMedianFinder.prototype.addNum = function(num) {\n    \n};\nMedianFinder.prototype.findMedian = function() {\n    \n};", java: "class MedianFinder {\n    public MedianFinder() {}\n    public void addNum(int num) {}\n    public double findMedian() { return 0.0; }\n}", cpp: "class MedianFinder {\npublic:\n    MedianFinder() {}\n    void addNum(int num) {}\n    double findMedian() {}\n};" }
  },
  {
    id: "smallest-range-covering-elements-from-k-lists",
    title: "Smallest Range Covering Elements from K Lists",
    difficulty: "Hard",
    topic: "Heap",
    statement: "You have k lists of sorted integers in non-decreasing order. Find the smallest range that includes at least one number from each of the k lists.",
    constraints: ["nums.length == k", "1 <= k <= 3500", "1 <= nums[i].length <= 50", "-10^5 <= nums[i][j] <= 10^5"],
    testCases: [{ input: "[[4,10,15,24,26],[0,9,12,20],[5,18,22,30]]", expectedOutput: "[20,24]" }],
    defaultCode: { python: "def solve(nums):\n    pass", javascript: "function solve(nums) {\n    \n}", java: "public int[] smallestRange(List<List<Integer>> nums) {\n    return null;\n}", cpp: "vector<int> smallestRange(vector<vector<int>>& nums) {}" }
  },
  {
    id: "k-closest-points-to-origin",
    title: "K Closest Points to Origin",
    difficulty: "Medium",
    topic: "Heap",
    statement: "Given an array of points where points[i] = [xi, yi] represents a point on the X-Y plane and an integer k, return the k closest points to the origin (0, 0).",
    constraints: ["1 <= k <= points.length <= 10^4", "-10^4 <= xi, yi <= 10^4"],
    testCases: [{ input: "points = [[1,3],[-2,2]], k = 1", expectedOutput: "[[-2,2]]" }],
    defaultCode: { python: "def solve(points, k):\n    pass", javascript: "function solve(points, k) {\n    \n}", java: "public int[][] kClosest(int[][] points, int k) {\n    return null;\n}", cpp: "vector<vector<int>> kClosest(vector<vector<int>>& points, int k) {}" }
  },
  {
    id: "longest-substring-without-repeating-characters",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    topic: "Sliding Window",
    statement: "Given a string s, find the length of the longest substring without repeating characters.",
    constraints: ["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols and spaces."],
    testCases: [{ input: "\"abcabcbb\"", expectedOutput: "3" }],
    defaultCode: { python: "def solve(s):\n    pass", javascript: "function solve(s) {\n    \n}", java: "public int lengthOfLongestSubstring(String s) {\n    return 0;\n}", cpp: "int lengthOfLongestSubstring(string s) {}" }
  },
  {
    id: "minimum-window-substring",
    title: "Minimum Window Substring",
    difficulty: "Hard",
    topic: "Sliding Window",
    statement: "Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window.",
    constraints: ["m == s.length", "n == t.length", "1 <= m, n <= 10^5"],
    testCases: [{ input: "s = \"ADOBECODEBANC\", t = \"ABC\"", expectedOutput: "\"BANC\"" }],
    defaultCode: { python: "def solve(s, t):\n    pass", javascript: "function solve(s, t) {\n    \n}", java: "public String minWindow(String s, String t) {\n    return \"\";\n}", cpp: "string minWindow(string s, string t) {}" }
  },
  {
    id: "permutation-in-string",
    title: "Permutation in String",
    difficulty: "Medium",
    topic: "Sliding Window",
    statement: "Given two strings s1 and s2, return true if s2 contains a permutation of s1, or false otherwise.",
    constraints: ["1 <= s1.length, s2.length <= 10^4", "s1 and s2 consist of lowercase English letters."],
    testCases: [{ input: "s1 = \"ab\", s2 = \"eidbaooo\"", expectedOutput: "true" }],
    defaultCode: { python: "def solve(s1, s2):\n    pass", javascript: "function solve(s1, s2) {\n    \n}", java: "public boolean checkInclusion(String s1, String s2) {\n    return false;\n}", cpp: "bool checkInclusion(string s1, string s2) {}" }
  },
  {
    id: "longest-repeating-character-replacement",
    title: "Longest Repeating Character Replacement",
    difficulty: "Medium",
    topic: "Sliding Window",
    statement: "You are given a string s and an integer k. You can choose any character of the string and change it to any other uppercase English character. You can perform this operation at most k times.",
    constraints: ["1 <= s.length <= 10^5", "0 <= k <= s.length"],
    testCases: [{ input: "s = \"ABAB\", k = 2", expectedOutput: "4" }],
    defaultCode: { python: "def solve(s, k):\n    pass", javascript: "function solve(s, k) {\n    \n}", java: "public int characterReplacement(String s, int k) {\n    return 0;\n}", cpp: "int characterReplacement(string s, int k) {}" }
  },
  {
    id: "find-all-anagrams-in-a-string",
    title: "Find All Anagrams in a String",
    difficulty: "Medium",
    topic: "Sliding Window",
    statement: "Given two strings s and p, return an array of all the start indices of p's anagrams in s. You may return the answer in any order.",
    constraints: ["1 <= s.length, p.length <= 3 * 10^4", "s and p consist of lowercase English letters."],
    testCases: [{ input: "s = \"cbaebabacd\", p = \"abc\"", expectedOutput: "[0,6]" }],
    defaultCode: { python: "def solve(s, p):\n    pass", javascript: "function solve(s, p) {\n    \n}", java: "public List<Integer> findAnagrams(String s, String p) {\n    return null;\n}", cpp: "vector<int> findAnagrams(string s, string p) {}" }
  },
  {
    id: "minimum-size-subarray-sum",
    title: "Minimum Size Subarray Sum",
    difficulty: "Medium",
    topic: "Sliding Window",
    statement: "Given an array of positive integers nums and a positive integer target, return the minimal length of a contiguous subarray of which the sum is greater than or equal to target.",
    constraints: ["1 <= target <= 10^9", "1 <= nums.length <= 10^5", "1 <= nums[i] <= 10^4"],
    testCases: [{ input: "target = 7, nums = [2,3,1,2,4,3]", expectedOutput: "2" }],
    defaultCode: { python: "def solve(target, nums):\n    pass", javascript: "function solve(target, nums) {\n    \n}", java: "public int minSubArrayLen(int target, int[] nums) {\n    return 0;\n}", cpp: "int minSubArrayLen(int target, vector<int>& nums) {}" }
  },
  {
    id: "fruit-into-baskets",
    title: "Fruit Into Baskets",
    difficulty: "Medium",
    topic: "Sliding Window",
    statement: "You are visiting a farm that has a single row of fruit trees from left to right. You want to collect as much fruit as possible. However, the owner has some strict rules.",
    constraints: ["1 <= fruits.length <= 10^5", "0 <= fruits[i] < fruits.length"],
    testCases: [{ input: "[1,2,1]", expectedOutput: "3" }],
    defaultCode: { python: "def solve(fruits):\n    pass", javascript: "function solve(fruits) {\n    \n}", java: "public int totalFruit(int[] fruits) {\n    return 0;\n}", cpp: "int totalFruit(vector<int>& fruits) {}" }
  },
  {
    id: "max-consecutive-ones-iii",
    title: "Max Consecutive Ones III",
    difficulty: "Medium",
    topic: "Sliding Window",
    statement: "Given a binary array nums and an integer k, return the maximum number of consecutive 1's in the array if you can flip at most k 0's.",
    constraints: ["1 <= nums.length <= 10^5", "0 <= k <= nums.length"],
    testCases: [{ input: "nums = [1,1,1,0,0,0,1,1,1,1,0], k = 2", expectedOutput: "6" }],
    defaultCode: { python: "def solve(nums, k):\n    pass", javascript: "function solve(nums, k) {\n    \n}", java: "public int longestOnes(int[] nums, int k) {\n    return 0;\n}", cpp: "int longestOnes(vector<int>& nums, int k) {}" }
  }
];
