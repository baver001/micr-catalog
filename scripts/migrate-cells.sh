#!/bin/bash
# Migrate remaining cells to new structure
set -e
BASE=/root/projects/micr.fun
TPL="$BASE/data/templates/cell.html"

create_cell() {
  local slug="$1" cat="$2"
  local dir="$BASE/cells/$cat/$slug"
  mkdir -p "$dir"
  sed "s/CELL_SLUG/$slug/g; s/CELL_CATEGORY/$cat/g" "$TPL" > "$dir/index.html"
}

# 1. Breathing (tools)
create_cell breathing tools
cat > "$BASE/cells/tools/breathing/content.en.html" << 'EN'
<p>Simple guided breathing exercises. Inhale. Hold. Exhale. Repeat.</p>
<p>Box breathing: 4-4-4-4. Inhale 4s, hold 4s, exhale 4s, hold 4s. The classic for calm and focus.</p>
<p>Related: [[focus]]</p>
EN
cat > "$BASE/cells/tools/breathing/content.ru.html" << 'RU'
<p>Простые упражнения для управляемого дыхания. Вдох. Задержка. Выдох. Повтор.</p>
<p>Квадратное дыхание: 4-4-4-4. Вдох 4с, задержка 4с, выдох 4с, задержка 4с. Классика для спокойствия и фокуса.</p>
<p>Связано: [[focus]]</p>
RU

# 2. Focus (tools)
create_cell focus tools
cat > "$BASE/cells/tools/focus/content.en.html" << 'EN'
<p>Deep work timer. Set a session, eliminate distractions, focus completely.</p>
<p>Used together with [[breathing]] before a session, then go deep.</p>
EN
cat > "$BASE/cells/tools/focus/content.ru.html" << 'RU'
<p>Таймер глубокой работы. Установите сессию, устраните отвлечения, фокусируйтесь полностью.</p>
<p>Используйте [[breathing]] перед сессией, затем погружайтесь.</p>
RU

# 3. Palette (tools)
create_cell palette tools
cat > "$BASE/cells/tools/palette/content.en.html" << 'EN'
<p>Generate and explore color palettes. Find harmonious combinations for your next project.</p>
<p>Play with hues, saturations, and lightness to discover unexpected pairings.</p>
EN
cat > "$BASE/cells/tools/palette/content.ru.html" << 'RU'
<p>Генерируйте и исследуйте цветовые палитры. Находите гармоничные сочетания для вашего следующего проекта.</p>
<p>Играйте с оттенками, насыщенностью и яркостью, чтобы найти неожиданные сочетания.</p>
RU

# 4. Dice (games)
create_cell dice games
cat > "$BASE/cells/games/dice/content.en.html" << 'EN'
<p>Roll the dice. Any dice. D6, D20, D12 — you choose.</p>
<p>Perfect for board games, RPGs, or making random decisions when you can't choose.</p>
EN
cat > "$BASE/cells/games/dice/content.ru.html" << 'RU'
<p>Бросьте кости. Любые. D6, D20, D12 — выбирайте сами.</p>
<p>Отлично для настольных игр, RPG или принятия случайных решений, когда не можете выбрать.</p>
RU

# 5. Reaction (games)
create_cell reaction games
cat > "$BASE/cells/games/reaction/content.en.html" << 'EN'
<p>Test your reflexes. Click as fast as you can when the screen changes.</p>
<p>Track your reaction time over time and see if you can improve.</p>
EN
cat > "$BASE/cells/games/reaction/content.ru.html" << 'RU'
<p>Проверьте рефлексы. Нажимайте как можно быстрее, когда экран меняется.</p>
<p>Отслеживайте время реакции и смотрите, можете ли вы улучшить результат.</p>
RU

# 6. Elon (knowledge)
create_cell elon knowledge
cat > "$BASE/cells/knowledge/elon/content.en.html" << 'EN'
<p>Notes on Elon Musk's thinking patterns: first principles reasoning, iterative design, and the obsession with physics.</p>
<p>Not about the man — about the mental models he uses.</p>
EN
cat > "$BASE/cells/knowledge/elon/content.ru.html" << 'RU'
<p>Заметки о мышлении Илона Маска: принципы первого принципа, итеративный дизайн и одержимость физикой.</p>
<p>Не о человеке — о мыслительных моделях, которые он использует.</p>
RU

# 7. Habits (knowledge)
create_cell habits knowledge
cat > "$BASE/cells/knowledge/habits/content.en.html" << 'EN'
<p>Small changes, remarkable results. Atomic habits — tiny 1% improvements — compound into extraordinary transformations.</p>
<p>Related to [[laziness]] — understanding resource deficits helps build better systems.</p>
EN
cat > "$BASE/cells/knowledge/habits/content.ru.html" << 'RU'
<p>Маленькие изменения, выдающиеся результаты. Атомные привычки — крошечные улучшения на 1% — накапливаются в необычайные трансформации.</p>
<p>Связано с [[laziness]] — понимание дефицита ресурсов помогает строить лучшие системы.</p>
RU

echo "DONE: $(find "$BASE/cells" -name 'index.html' | wc -l) cells created"
echo "Cells created:"
find "$BASE/cells" -name 'content.en.html' -exec dirname {} \; | sort | while read d; do
  slug=$(basename "$d")
  cat=$(basename $(dirname "$d"))
  echo "  /cells/$cat/$slug/"
done
