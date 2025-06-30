const fileInput = document.getElementById('mdFileInput');
const preview = document.getElementById('preview');

function getIndent(line) {
    const match = line.match(/^(\s*)/);
    return match ? match[1].length : 0;
}

function parseToggles(lines, startIndex = 0, currentIndent = 0) {
    let result = '';
    let i = startIndex;

    while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // 空行は無視
    if (line === '') {
        result += '\n'; // 空行はそのまま保持
        i++;
        continue;
    }

    const indent = getIndent(rawLine);

    // インデントが浅くなったらトグル終了
    if (indent < currentIndent) {
        break;
    }

    // トグル開始
    if (line.startsWith('+ ')) {
        const title = line.slice(2).trim();
        i++;

        const [innerMarkdown, newIndex] = parseToggles(lines, i, indent + 1);
        i = newIndex;

        // トグルをMarkdownのまま組み込む
        result += `<details><summary>${title}</summary>\n\n${innerMarkdown.replace(/^ {2,}/gm, '')}\n\n</details>\n\n`;
    } else {
        result += rawLine + '\n';
        i++;
    }
    }

    return [result, i];
}

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) {
    preview.innerHTML = 'ファイルが選択されていません';
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target.result;
    const lines = text.split(/\r?\n/);

    const [parsedText, _] = parseToggles(lines, 0, 0);

    const html = marked.parse(parsedText);
    const htmlWithTarget = html.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ');
    preview.innerHTML = htmlWithTarget;
  };
  reader.readAsText(file);
});
