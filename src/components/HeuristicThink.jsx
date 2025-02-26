import React from 'react';

const HeuristicThink = ({response}) => {

    const formatText = (text) => {
        if (!text) return [];
        
        // Ensure text is a string
        const textString = String(text);
        
        // Replace escaped newlines with actual newlines
        const processedText = textString.replace(/\\n/g, '\n');
        
        // Split the text into lines
        const lines = processedText.split('\n');
        const formattedLines = [];
        
        let inCodeBlock = false;
        let codeContent = '';
        let codeLanguage = '';
        
        lines.forEach((line, index) => {
          // Handle code blocks
          if (line.trim().startsWith('```')) {
            if (inCodeBlock) {
              formattedLines.push(
                <pre key={`code-${index}`} className="bg-gray-100 p-4 rounded my-4 overflow-x-auto font-mono text-sm">
                  <div className="mb-2 text-xs text-gray-500">{codeLanguage}</div>
                  <code className="whitespace-pre-wrap">{codeContent}</code>
                </pre>
              );
              codeContent = '';
              codeLanguage = '';
              inCodeBlock = false;
            } else {
              inCodeBlock = true;
              // Extract language if specified (e.g., ```python)
              codeLanguage = line.trim().slice(3);
            }
            return;
          }
          
          if (inCodeBlock) {
            codeContent += line + '\n';
            return;
          }
          
          // Format line based on markdown-like syntax
          let formattedLine;
          
          if (line.trim().startsWith('## ')) {
            // Main heading
            formattedLine = (
              <h2 key={index} className="text-2xl font-bold mt-6 mb-4 text-gray-800 border-b pb-2">
                {line.replace('## ', '')}
              </h2>
            );
          } else if (line.trim().startsWith('### ')) {
            // Subheading
            formattedLine = (
              <h3 key={index} className="text-xl font-semibold mt-5 mb-3 text-gray-700">
                {line.replace('### ', '')}
              </h3>
            );
          } else if (line.trim().startsWith('#### ')) {
            // Small heading
            formattedLine = (
              <h4 key={index} className="text-lg font-semibold mt-4 mb-2 text-gray-700">
                {line.replace('#### ', '')}
              </h4>
            );
          } else if (line.trim().startsWith('* ')) {
            // Bullet point
            const indentLevel = line.indexOf('* ') / 2;
            formattedLine = (
              <div key={index} className="flex mb-1" style={{ paddingLeft: `${indentLevel * 1.5}rem` }}>
                <span className="mr-2">•</span>
                <span>{formatInlineText(line.replace('* ', ''))}</span>
              </div>
            );
          } else if (line.trim().match(/^\d+\. /)) {
            // Numbered list
            const content = line.replace(/^\d+\. /, '');
            const match = line.match(/^(\d+)\. /);
            const number = match ? match[1] : '1';
            formattedLine = (
              <div key={index} className="flex mb-1">
                <span className="mr-2 font-medium">{number}.</span>
                <span>{formatInlineText(content)}</span>
              </div>
            );
          } else if (line.trim().startsWith('> ')) {
            // Blockquote
            formattedLine = (
              <blockquote key={index} className="border-l-4 border-gray-300 pl-4 italic my-4 text-gray-600">
                {formatInlineText(line.replace('> ', ''))}
              </blockquote>
            );
          } else if (line.trim() === '---') {
            // Horizontal rule
            formattedLine = <hr key={index} className="my-4 border-t border-gray-300" />;
          } else if (line.trim() === '') {
            // Empty line
            formattedLine = <div key={index} className="h-4"></div>;
          } else {
            // Regular paragraph
            formattedLine = (
              <p key={index} className="mb-4">
                {formatInlineText(line)}
              </p>
            );
          }
          
          formattedLines.push(formattedLine);
        });
        
        return formattedLines;
      };
      
      // Function to handle inline formatting (bold, italic, etc.)
      const formatInlineText = (text) => {
        if (!text) return '';
        
        // Find all bold text (**text**)
        const boldRegex = /\*\*(.*?)\*\*/g;
        const parts = [];
        let lastIndex = 0;
        let match;
        
        while ((match = boldRegex.exec(text)) !== null) {
          if (match.index > lastIndex) {
            parts.push(formatItalic(text.substring(lastIndex, match.index)));
          }
          parts.push(<strong key={`bold-${match.index}`}>{formatItalic(match[1])}</strong>);
          lastIndex = match.index + match[0].length;
        }
        
        if (lastIndex < text.length) {
          parts.push(formatItalic(text.substring(lastIndex)));
        }
        
        return parts.length > 0 ? parts : text;
      };
      
      // Function to handle italic formatting (*text*)
      const formatItalic = (text) => {
        if (!text) return '';
        if (typeof text !== 'string') return text;
        
        const italicRegex = /\*(.*?)\*/g;
        const parts = [];
        let lastIndex = 0;
        let match;
        
        while ((match = italicRegex.exec(text)) !== null) {
          if (match.index > lastIndex) {
            parts.push(text.substring(lastIndex, match.index));
          }
          parts.push(<em key={`italic-${match.index}`}>{match[1]}</em>);
          lastIndex = match.index + match[0].length;
        }
        
        if (lastIndex < text.length) {
          parts.push(text.substring(lastIndex));
        }
        
        return parts.length > 0 ? parts : text;
      };
      
    //#9500FF,rgb(107,114,128)
    return (
        <div style={{
            borderLeft: "3px solid rgb(220,220,220)",
            paddingLeft: "20px",
            marginBottom: "10px",
            maxWidth: "90%",
            color: "rgb(128, 82, 149)",
            lineHeight: "30px",
            fontSize: "14px",
            letterSpacing: "0.01em",
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
        }}>
            {formatText(response)}
            {/* <p style={{color:"grey"}}>{response}</p> */}
        </div>
    );
};

export default HeuristicThink;