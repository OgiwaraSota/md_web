const fileInput = document.getElementById('mdFileInput');
const preview = document.getElementById('preview');
const dropArea = document.getElementById('dropArea'); // ドラッグエリア

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
            result += '\n';
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

            result += `<details><summary>${title}</summary>\n\n${innerMarkdown.replace(/^ {2,}/gm, '')}\n\n</details>\n\n`;
        } else {
            result += rawLine + '\n';
            i++;
        }
    }

    return [result, i];
}

// ファイル処理の共通関数
function handleFile(file) {
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
}

// ファイル選択イベント
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) {
        preview.innerHTML = 'ファイルが選択されていません';
        return;
    }
    handleFile(file);
});

// ドラッグ＆ドロップイベント
dropArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropArea.classList.add('dragover');
});

dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('dragover');
});

dropArea.addEventListener('drop', (event) => {
    event.preventDefault();
    dropArea.classList.remove('dragover');

    const file = event.dataTransfer.files[0];
    if (file) {
        handleFile(file);
    }
});
