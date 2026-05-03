import React, { useState, useEffect, useRef } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/themes/prism.css';
import { 
  Play, 
  RotateCcw, 
  Save, 
  Loader2, 
  Terminal, 
  Maximize2, 
  Minimize2,
  ZoomIn,
  ZoomOut,
  Settings, 
  CheckCircle2, 
  XCircle,
  Eye,
  EyeOff,
  PanelRight,
  PanelRightClose
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { executeCode } from '../../services/gemini';
import { Problem } from '../../constants/codingProblems';
import { auth, updateUserStats } from '../../lib/firebase';

interface CodeEditorProps {
  problem: Problem;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  isAssessmentMode?: boolean;
  onSuccess?: () => void;
  onCodeChange?: (code: string, language: string) => void;
  showDescription?: boolean;
}

export default function CodeEditor({ 
  problem, 
  isExpanded, 
  onToggleExpand, 
  isAssessmentMode, 
  onSuccess,
  onCodeChange,
  showDescription = true
}: CodeEditorProps) {
  const [language, setLanguage] = useState(isAssessmentMode ? 'javascript' : 'python');
  const [code, setCode] = useState("");
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<{ passed: boolean, message: string } | null>(null);
  const [allVisiblePassed, setAllVisiblePassed] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [fontSize, setFontSize] = useState(13);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Protected regions
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [userCode, setUserCode] = useState("");
  
  const initializeCode = (lang: string) => {
    let initialCodeValue = "";
    if (problem.defaultCode && problem.defaultCode[lang]) {
      initialCodeValue = problem.defaultCode[lang];
    } else {
      const defaults: Record<string, string> = {
        python: "def solve(params):\n    pass",
        javascript: "function solve(params) {\n    // Write your logic here\n}",
        java: "public class Solution {\n    public static Object solve(Object input) {\n        return null;\n    }\n}",
        cpp: "class Solution {\npublic:\n    auto solve(auto input) {\n        \n    }\n};"
      };
      initialCodeValue = defaults[lang] || "";
    }

    let p = "";
    let s = "";
    let u = "";
    const markers = ["...", "// Write your logic here", "pass", "return null;"];
    let found = false;
    for (const marker of markers) {
      if (initialCodeValue.includes(marker)) {
        const parts = initialCodeValue.split(marker);
        p = parts[0];
        s = parts[1];
        u = marker;
        found = true;
        break;
      }
    }

    if (!found) {
      const lastBraceStart = initialCodeValue.lastIndexOf('{');
      const firstBraceEnd = initialCodeValue.indexOf('}', lastBraceStart);
      if (lastBraceStart !== -1 && firstBraceEnd !== -1) {
        p = initialCodeValue.substring(0, lastBraceStart + 1) + "\n    ";
        s = "\n" + initialCodeValue.substring(firstBraceEnd);
        u = "// Start typing...";
      } else {
        p = ""; s = ""; u = initialCodeValue;
      }
    }

    setPrefix(p);
    setSuffix(s);
    setUserCode(u);
    setCode(p + u + s);
    
    // Initialize history with the user part only
    const initialConfig = { code: u, sel: { start: 0, end: 0 } };
    setHistory([initialConfig]);
    setFuture([]);
    lastPushTimeRef.current = Date.now();
  };

  // History management
  const [history, setHistory] = useState<{code: string; sel: {start: number; end: number}}[]>([]);
  const [future, setFuture] = useState<{code: string; sel: {start: number; end: number}}[]>([]);
  const lastPushTimeRef = useRef<number>(0);
  const isUndoRedoActionRef = useRef<boolean>(false);

  useEffect(() => {
    initializeCode(language);
    
    setOutput([]);
    setTestResults(null);
    setAllVisiblePassed(false);
    
    if (!isAssessmentMode) {
      const solved = JSON.parse(localStorage.getItem('solved_problems') || '{}');
      setIsSolved(!!solved[problem.id]);
    } else {
      setIsSolved(false);
    }
  }, [problem.id, language, isAssessmentMode]);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
  };

  const addToHistory = (newCode: string, selection: {start: number; end: number}, force: boolean = false) => {
    setHistory(prev => {
      const now = Date.now();
      // If force is true (e.g. Enter, Tab, Paste) or it's been more than 1.5s since last push
      if (force || (now - lastPushTimeRef.current > 1500)) {
        // Only push if different from last
        if (prev.length > 0 && prev[prev.length - 1].code === newCode) return prev;
        lastPushTimeRef.current = now;
        return [...prev, { code: newCode, sel: selection }];
      }
      // Otherwise update the last entry if we just typed within the grouping window
      // but only if we have at least 2 entries (initial + first typing)
      if (prev.length > 1) {
        const updated = [...prev];
        updated[updated.length - 1] = { code: newCode, sel: selection };
        return updated;
      }
      // If we only have 1 entry (starter), push the first change
      return [...prev, { code: newCode, sel: selection }];
    });
    setFuture([]);
  };

  const handleUndo = () => {
    setHistory(prev => {
      if (prev.length <= 1) return prev; 
      
      const newHistory = [...prev];
      const current = newHistory.pop()!;
      const previous = newHistory[newHistory.length - 1];
      
      setFuture(f => [current, ...f]);
      
      isUndoRedoActionRef.current = true;
      setUserCode(previous.code);
      setCode(prefix + previous.code + suffix);
      
      // Update cursor
      setTimeout(() => {
        const textarea = document.querySelector('textarea.outline-none') as HTMLTextAreaElement;
        if (textarea) {
          textarea.selectionStart = prefix.length + previous.sel.start;
          textarea.selectionEnd = prefix.length + previous.sel.end;
          textarea.focus();
        }
        isUndoRedoActionRef.current = false;
      }, 0);
      
      return newHistory;
    });
  };

  const handleRedo = () => {
    setFuture(prev => {
      if (prev.length === 0) return prev;
      
      const newFuture = [...prev];
      const next = newFuture.shift()!;
      
      setHistory(h => [...h, next]);
      
      isUndoRedoActionRef.current = true;
      setUserCode(next.code);
      setCode(prefix + next.code + suffix);
      
      // Update cursor
      setTimeout(() => {
        const textarea = document.querySelector('textarea.outline-none') as HTMLTextAreaElement;
        if (textarea) {
          textarea.selectionStart = prefix.length + next.sel.start;
          textarea.selectionEnd = prefix.length + next.sel.end;
          textarea.focus();
        }
        isUndoRedoActionRef.current = false;
      }, 0);
      
      return newFuture;
    });
  };

  const handleInternalCodeChange = (newFullCode: string) => {
    // Determine if the template part was changed
    if (!newFullCode.startsWith(prefix) || !newFullCode.endsWith(suffix)) {
      // Block changes to the prefix or suffix
      return;
    }

    const newUserCode = newFullCode.slice(prefix.length, newFullCode.length - suffix.length);
    setUserCode(newUserCode);
    setCode(newFullCode);

    if (onCodeChange) {
      onCodeChange(newFullCode, language);
    }
    
    // Only add to history if not coming from undo/redo itself
    if (!isUndoRedoActionRef.current) {
      const textarea = document.querySelector('textarea.outline-none') as HTMLTextAreaElement;
      const sel = textarea 
        ? { start: Math.max(0, textarea.selectionStart - prefix.length), end: Math.max(0, textarea.selectionEnd - prefix.length) } 
        : { start: 0, end: 0 };
      addToHistory(newUserCode, sel);
    }
  };

  const resetCode = () => {
    initializeCode(language);
    setOutput([]);
    setTestResults(null);
  };

  const executeLocally = (code: string, testCases: any[]) => {
    const results = [];
    let passedCount = 0;

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      try {
        // Prepare the environment
        // If the code is just logic, we wrap it. If it contains a solve function, we call it.
        let fn;
        const trimmedCode = code.trim();
        
        if (trimmedCode.includes('function solve') || trimmedCode.startsWith('const solve =') || trimmedCode.startsWith('let solve =')) {
          fn = new Function(`${code}\nreturn solve(${tc.input});`);
        } else {
          fn = new Function(`const solve = () => { ${code} };\nreturn solve(${tc.input});`);
        }

        const result = fn();
        const actual = typeof result === 'object' ? JSON.stringify(result) : String(result);
        const expected = tc.output || tc.expectedOutput;
        
        // Clean up expected if it's a string representation of an array/object
        const normalizedActual = actual.replace(/\s/g, '');
        const normalizedExpected = String(expected).replace(/\s/g, '');
        
        const passed = normalizedActual === normalizedExpected;
        if (passed) passedCount++;
        
        results.push(`Case ${i+1}: Input: ${tc.input} | Output: ${actual} | ${passed ? '✅ Passed' : '❌ Failed'}`);
      } catch (err: any) {
        results.push(`Case ${i+1}: 🔴 ERROR: ${err.message}`);
      }
    }
    return { results, passedAll: passedCount === testCases.length };
  };

  const runCode = async () => {
    setIsRunning(true);
    setShowEvaluation(true);
    setAllVisiblePassed(false);
    setOutput(["Running Visible Test Cases..."]);
    setTestResults(null);
    
    if (isAssessmentMode && language === 'javascript') {
      // Local execution for speed and precision in assessments
      const { results, passedAll } = executeLocally(code, problem.testCases);
      setOutput(prev => [...prev, ...results]);
      if (passedAll) {
        setTestResults({ passed: true, message: "All 3 visible test cases passed! Now verify with hidden cases." });
        setAllVisiblePassed(true);
      } else {
        setTestResults({ passed: false, message: "Failed visible test cases. Fix your logic." });
      }
      setIsRunning(false);
      return;
    }

    try {
      const result = await executeCode(code, language, JSON.stringify(problem.testCases));
      const lines = result.split('\n').filter(l => l.trim() !== "");
      setOutput(prev => [...prev, ...lines]);
      
      const successPatterns = [
        "verdict: passed",
        "verdict: accepted",
        "all passed",
        "passed all cases",
        "overallstatus: all passed",
        "passed all test cases",
        "all test cases passed",
        "✅ passed",
        "status: passed",
        "status: accepted"
      ];
      
      const normalizedResult = result.toLowerCase().replace(/\*\*/g, "").replace(/__/g, "").replace(/✅/g, " ").trim();
      const isSuccess = successPatterns.some(p => normalizedResult.includes(p)) || 
                        normalizedResult.includes("verdict: accepted") ||
                        normalizedResult.includes("verdict: passed") ||
                        (normalizedResult.includes("passed") && !normalizedResult.includes("failed")) ||
                        (normalizedResult.includes("failed: 0") && normalizedResult.includes("passed:"));

      if (isSuccess) {
        setTestResults({ passed: true, message: "All visible test cases passed! You can now submit your solution." });
        setAllVisiblePassed(true);
      } else {
        setTestResults({ passed: false, message: "Some visible test cases failed. Please check the output." });
      }
    } catch (error) {
      setOutput(prev => [...prev, "Error: Execution failed."]);
      setTestResults({ passed: false, message: "Execution Error encountered." });
    } finally {
      setIsRunning(false);
    }
  };

  const submitCode = async () => {
    if (!allVisiblePassed && !isSolved) return;
    
    setIsSubmitting(true);
    setShowEvaluation(true);
    setOutput(prev => [...prev, "Running Hidden Test Cases..."]);
    
    if (isAssessmentMode && language === 'javascript') {
      const allTests = [...problem.testCases, ...(problem.hiddenTestCases || [])];
      const { results, passedAll } = executeLocally(code, allTests);
      setOutput(prev => [...prev, ...results]);
      
      if (passedAll) {
        setTestResults({ passed: true, message: "PERFECT! All test cases (including 5 hidden) passed." });
        setIsSolved(true);
        
        // Update stats
        if (auth.currentUser) {
          const solved = JSON.parse(localStorage.getItem('solved_problems') || '{}');
          const isNew = !solved[problem.id];
          await updateUserStats(auth.currentUser.uid, 50, isNew);
          
          if (isNew) {
            solved[problem.id] = true;
            localStorage.setItem('solved_problems', JSON.stringify(solved));
            window.dispatchEvent(new Event('storage'));
          }
        }

        if (onSuccess) onSuccess();
      } else {
        setTestResults({ passed: false, message: "Failed on hidden test cases." });
        setAllVisiblePassed(false);
      }
      setIsSubmitting(false);
      return;
    }

    try {
      const allTests = [...problem.testCases, ...(problem.hiddenTestCases || [])];
      const result = await executeCode(code, language, JSON.stringify(allTests));
      const lines = result.split('\n').filter(l => l.trim() !== "");
      setOutput(prev => [...prev, ...lines]);
      
      const successPatterns = [
        "verdict: passed",
        "verdict: accepted",
        "all passed",
        "passed all cases",
        "overallstatus: all passed",
        "passed all test cases",
        "all test cases passed",
        "✅ passed",
        "status: passed",
        "status: accepted"
      ];
      
      const normalizedResult = result.toLowerCase().replace(/\*\*/g, "").replace(/__/g, "").replace(/✅/g, " ").trim();
      const isSuccess = successPatterns.some(p => normalizedResult.includes(p)) || 
                        normalizedResult.includes("verdict: accepted") ||
                        normalizedResult.includes("verdict: passed") ||
                        (normalizedResult.includes("passed") && !normalizedResult.includes("failed")) ||
                        (normalizedResult.includes("failed: 0") && normalizedResult.includes("passed:"));

      if (isSuccess) {
        setTestResults({ passed: true, message: "CONGRATULATIONS! All test cases passed (including hidden ones)." });
        setIsSolved(true);
        
        if (auth.currentUser) {
          const solved = JSON.parse(localStorage.getItem('solved_problems') || '{}');
          const isNew = !solved[problem.id];
          await updateUserStats(auth.currentUser.uid, 50, isNew);
          
          if (!isAssessmentMode) {
            solved[problem.id] = true;
            localStorage.setItem('solved_problems', JSON.stringify(solved));
            window.dispatchEvent(new Event('storage'));
          }
        }
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setTestResults({ passed: false, message: "Failed on hidden test cases. Try optimizing your solution." });
        setAllVisiblePassed(false);
      }
    } catch (error) {
      setOutput(prev => [...prev, "Error: Submission failed."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const { selectionStart, selectionEnd, value } = textarea;

    // Guard: Prevent cursor from moving into protected regions on KeyDown
    // If cursor is at the very beginning of userCode, backspace should be blocked
    if (e.key === 'Backspace' && selectionStart === selectionEnd && selectionStart <= prefix.length) {
      e.preventDefault();
      return;
    }
    
    // If deletion/selection spans into template
    if (e.key === 'Backspace' || e.key === 'Delete') {
      if (selectionStart < prefix.length || selectionEnd > value.length - suffix.length) {
        e.preventDefault();
        return;
      }
    }

    // 0. Handle Undo/Redo shortcuts
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        handleRedo();
      } else {
        handleUndo();
      }
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      handleRedo();
      return;
    }

    // Capture state for special keys
    const saveCurrent = () => {
      addToHistory(value, { start: selectionStart, end: selectionEnd }, true);
    };

    // 1. Handle auto-closing pairs: (), [], {}, "", '', ``
    const pairs: Record<string, string> = {
      '(': ')',
      '[': ']',
      '{': '}',
      "'": "'",
      '"': '"',
      '`': '`',
    };

    if (pairs[e.key]) {
      e.preventDefault();
      saveCurrent();
      const closing = pairs[e.key];
      const start = selectionStart;
      const end = selectionEnd;
      
      const newValue = value.substring(0, start) + e.key + closing + value.substring(end);
      setCode(newValue);
      
      // We need to set the cursor position after the state update
      // Using a small timeout to ensure React has updated the value
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
      return;
    }

    // 2. Handle Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      saveCurrent();
      const start = selectionStart;
      const end = selectionEnd;
      
      // Insert 4 spaces
      const newValue = value.substring(0, start) + '    ' + value.substring(end);
      setCode(newValue);
      
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
      return;
    }

    // 3. Handle Backspace for paired symbols
    if (e.key === 'Backspace' && selectionStart === selectionEnd && selectionStart > 0) {
      const charBefore = value[selectionStart - 1];
      const charAt = value[selectionStart];
      if ((charBefore === '(' && charAt === ')') ||
          (charBefore === '[' && charAt === ']') ||
          (charBefore === '{' && charAt === '}') ||
          (charBefore === "'" && charAt === "'") ||
          (charBefore === '"' && charAt === '"') ||
          (charBefore === '`' && charAt === '`')) {
        e.preventDefault();
        saveCurrent();
        const newValue = value.substring(0, selectionStart - 1) + value.substring(selectionStart + 1);
        setCode(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart - 1;
        }, 0);
        return;
      }
    }

    // 4. Avoid duplicating closing symbols if they already exist
    const closingChars = [')', ']', '}', "'", '"', '`'];
    if (closingChars.includes(e.key) && selectionStart === selectionEnd && value[selectionStart] === e.key) {
      e.preventDefault();
      textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
      return;
    }

    // 3. Handle Backspace for pairs (delete both if empty)
    if (e.key === 'Backspace' && selectionStart === selectionEnd) {
      const charBefore = value[selectionStart - 1];
      const charAfter = value[selectionStart];
      if (pairs[charBefore] === charAfter) {
        e.preventDefault();
        saveCurrent();
        const newValue = value.substring(0, selectionStart - 1) + value.substring(selectionStart + 1);
        setCode(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart - 1;
        }, 0);
        return;
      }
    }

    // 4. Handle Enter for smart indentation
    if (e.key === 'Enter') {
      saveCurrent();
      const charBefore = value[selectionStart - 1];
      
      // Get current line's indentation
      const linesBefore = value.substring(0, selectionStart).split('\n');
      const currentLine = linesBefore[linesBefore.length - 1];
      const indentMatch = currentLine.match(/^\s*/);
      const currentIndent = indentMatch ? indentMatch[0] : '';

      if (charBefore === '{') {
        e.preventDefault();
        const oneLevelIndent = '    '; // 4 spaces
        const newIndent = currentIndent + oneLevelIndent;
        
        // Check if there is already a closing brace after the cursor
        const codeAfter = value.substring(selectionStart).trim();
        const hasClosingBrace = codeAfter.startsWith('}');
        
        let newValue;
        if (hasClosingBrace) {
          // Just insert newline and indent
          newValue = value.substring(0, selectionStart) + 
                     '\n' + newIndent + 
                     '\n' + currentIndent + 
                     value.substring(value.indexOf('}', selectionStart));
        } else {
          newValue = value.substring(0, selectionStart) + 
                     '\n' + newIndent + 
                     '\n' + currentIndent + '}' + 
                     value.substring(selectionEnd);
        }
        
        setCode(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + newIndent.length + 1;
        }, 0);
      } else if (charBefore === ':') {
        // Handle Python style indentation
        e.preventDefault();
        const oneLevelIndent = '    ';
        const newIndent = currentIndent + oneLevelIndent;
        const newValue = value.substring(0, selectionStart) + '\n' + newIndent + value.substring(selectionEnd);
        setCode(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + newIndent.length + 1;
        }, 0);
      } else {
        // Regular Enter: maintain indentation
        e.preventDefault();
        const newValue = value.substring(0, selectionStart) + '\n' + currentIndent + value.substring(selectionEnd);
        setCode(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + currentIndent.length + 1;
        }, 0);
      }
    }
  };

  return (
    <div className={`${isFullScreen ? 'fixed inset-0 z-[100] m-0 rounded-none' : 'relative h-full'} flex flex-col bg-[#1e1e1e] rounded-xl border border-gray-800 overflow-hidden shadow-2xl`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div className="h-3 w-3 rounded-full bg-amber-500" />
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </div>
          <select 
            value={language} 
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="text-xs font-bold text-gray-300 bg-[#2d2d2d] border border-gray-700 rounded px-3 py-1.5 focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer hover:bg-[#3d3d3d] transition-colors"
          >
            <option value="python">Python 3.10</option>
            <option value="javascript">Node.js 18</option>
            <option value="java">Java 17 (OpenJDK)</option>
            <option value="cpp">C++ 20 (GCC)</option>
          </select>
          <div className="flex items-center gap-1 bg-[#2d2d2d] border border-gray-700 rounded px-1">
            <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0 text-gray-400 hover:text-white" 
                onClick={() => setFontSize(Math.max(10, fontSize - 1))}
                title="Zoom Out"
            >
                <ZoomOut size={12} />
            </Button>
            <span className="text-[10px] font-mono text-gray-500 min-w-[20px] text-center">{fontSize}px</span>
            <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0 text-gray-400 hover:text-white" 
                onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                title="Zoom In"
            >
                <ZoomIn size={12} />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-8 px-2 gap-2 text-xs font-bold transition-all ${showEvaluation ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setShowEvaluation(!showEvaluation)}
            title={showEvaluation ? "Hide Evaluation" : "Show Evaluation"}
          >
            {showEvaluation ? <PanelRightClose size={14} /> : <PanelRight size={14} />}
            <span className="hidden sm:inline">{showEvaluation ? "Hide Evaluation" : "Evaluation"}</span>
          </Button>
          <div className="w-[1px] h-4 bg-gray-700 mx-1" />
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-800" 
            onClick={() => setIsFullScreen(!isFullScreen)}
            title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullScreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </Button>
          {onToggleExpand && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-800" 
              onClick={onToggleExpand}
              title={isExpanded ? "Minimize" : "Maximize"}
            >
              {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </Button>
          )}
          <div className="w-[1px] h-4 bg-gray-700 mx-1" />
          {isSolved && (
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] hidden sm:flex items-center gap-1">
              <CheckCircle2 size={10} />
              SOLVED
            </Badge>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-800" 
            onClick={resetCode}
            title="Reset Code"
          >
            <RotateCcw size={14} />
          </Button>
          <div className="w-[1px] h-4 bg-gray-700 mx-1" />
          <Button 
            size="sm" 
            variant="outline"
            disabled={isRunning || isSubmitting}
            onClick={runCode}
            className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white gap-2 h-8 px-4 font-bold text-xs"
          >
            {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            Run
          </Button>
          {(allVisiblePassed || isSolved) && (
            <Button 
              size="sm" 
              disabled={isSubmitting}
              onClick={submitCode}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-8 px-4 font-bold text-xs shadow-lg shadow-emerald-900/20"
            >
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Submit Solution
            </Button>
          )}
        </div>
      </div>

      {/* Editor & Terminal Layout */}
      <div className="flex-1 flex overflow-hidden flex-col md:flex-row divide-x divide-gray-800">
        {/* Left Panel: Description */}
        {showDescription && (
          <div className="w-full md:w-72 bg-[#0a0a0a] flex flex-col shrink-0 overflow-hidden">
            <div className="px-4 py-2 bg-[#1a1a1a] border-b border-gray-800 flex items-center gap-2">
              <Terminal size={12} className="text-emerald-500" />
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Problem</span>
            </div>
            <div className="flex-1 p-4 overflow-auto custom-scrollbar space-y-4">
              <div className="text-xs font-bold text-gray-300 leading-relaxed">
                {problem.statement}
              </div>
              
              <div className="space-y-3">
                <h5 className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Examples</h5>
                {problem.testCases.slice(0, 2).map((tc, i) => (
                  <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/5 font-mono text-[10px]">
                    <div className="text-indigo-400 mb-1">Example {i+1}</div>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">In:</span>
                        <span className="text-gray-300">{tc.input}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Out:</span>
                        <span className="text-emerald-400">{tc.expectedOutput || (tc as any).output}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Center: Editor Area */}
        <div className="flex-1 flex overflow-hidden border-b md:border-b-0 border-gray-800">
          <div className="w-10 bg-[#1e1e1e] border-r border-gray-800 flex flex-col items-center py-4 text-[10px] font-mono text-gray-600 select-none overflow-hidden shrink-0">
            {Array.from({ length: Math.max(30, code.split('\n').length + 10) }).map((_, i) => (
              <div key={i} className="h-[21px] leading-[21px]">{i + 1}</div>
            ))}
          </div>
          
          <div className="flex-1 overflow-auto bg-[#1e1e1e] relative scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
            <Editor
              value={code}
              onValueChange={handleInternalCodeChange}
              onKeyDown={handleKeyDown}
              highlight={code => highlight(code, languages[language] || languages.javascript, language)}
              padding={16}
              textareaClassName="outline-none focus:ring-0 min-h-full"
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                fontSize: `${fontSize}px`,
                minHeight: '100%',
                width: '100%',
                color: '#d4d4d4',
                lineHeight: '21px',
              }}
            />
          </div>
        </div>

        {/* Right Panel: Evaluation Output */}
        {showEvaluation && (
          <div className="w-full md:w-80 bg-[#0a0a0a] flex flex-col shrink-0 overflow-hidden border-l border-gray-800 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1a] border-b border-gray-800">
              <div className="flex items-center gap-2 text-[9px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">
                <Terminal size={12} className="text-indigo-500" />
                Evaluation
              </div>
              <div className="flex items-center gap-2">
                {testResults && (
                  <div className={`text-[9px] font-bold flex items-center gap-1 px-2 py-0.5 rounded shadow-sm ${testResults.passed ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {testResults.passed ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                    {testResults.passed ? "PASSED" : "FAILED"}
                  </div>
                )}
                <button 
                  onClick={() => setShowEvaluation(false)}
                  className="p-1 hover:bg-white/5 rounded text-gray-500 hover:text-white transition-colors"
                  title="Hide Panel"
                >
                  <XCircle size={12} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-4 overflow-auto font-mono text-[11px] text-gray-300 space-y-2 scrollbar-thin scrollbar-thumb-gray-800">
              {testResults && (
                <div className={`p-3 rounded mb-3 ${testResults.passed ? 'bg-green-500/5 border border-green-500/20' : 'bg-red-500/5 border border-red-500/20'}`}>
                  <p className={`font-bold leading-relaxed ${testResults.passed ? 'text-green-400' : 'text-red-400'}`}>
                    {testResults.message}
                  </p>
                </div>
              )}
              
              <div className="space-y-1.5">
                {output.length === 0 && !testResults && !isRunning && !isSubmitting && (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-700 gap-3 grayscale opacity-40">
                    <Terminal size={32} />
                    <div className="text-[10px] text-center font-bold uppercase tracking-widest leading-relaxed">
                      Awaiting<br/>Logic
                    </div>
                  </div>
                )}
                
                {output.map((line, i) => (
                  <div key={i} className={`flex gap-2 py-0.5 border-b border-white/5 ${
                    line.toLowerCase().includes("passed") || line.toLowerCase().includes("verdict: passed") ? "text-emerald-400 font-bold" : 
                    line.toLowerCase().includes("failed") || line.toLowerCase().includes("error") ? "text-red-400" : 
                    line.includes("Compiling") || line.includes("Running") ? "text-indigo-400 italic" : ""
                  }`}>
                    <span className="text-gray-700 select-none shrink-0">›</span>
                    <span className="break-all">{line}</span>
                  </div>
                ))}
                
                {(isRunning || isSubmitting) && (
                  <div className="flex items-center gap-2 text-indigo-400 animate-pulse py-2">
                    <Loader2 size={14} className="animate-spin" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">
                      {isSubmitting ? "Hidden Tests..." : `Running...`}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-3 bg-[#0a0a0a] border-t border-gray-800 mt-auto">
               <button 
                 className="w-full py-2 bg-gray-950 hover:bg-black text-[9px] font-black text-gray-500 rounded transition-colors uppercase tracking-widest"
                 onClick={() => setOutput([])}
               >
                 Clear Output
               </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
