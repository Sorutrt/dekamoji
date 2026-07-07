# dekamoji

URL のパスに入れた文字を、ブラウザで大きく表示するだけの小さなアプリです。

## 使い方

```powershell
mise exec -- node src/server.js
```

起動後、ブラウザで次のように開きます。

```text
http://localhost:3050/ひたすらでかい文字
```

`/` の後ろに入れた文字が、そのまま大きく表示されます。

文字の中で `$...$` または `\(...\)` と書いた部分はインライン数式、`$$...$$` または `\[...\]` と書いた部分はディスプレイ数式として表示されます。

```text
http://localhost:3050/面積は $S=ab$
http://localhost:3050/$$E=mc^2$$
```

文字色は `color` クエリに 16 進 6 桁または 3 桁で指定できます。

```text
http://localhost:3050/赤い文字?color=ff0000
http://localhost:3050/赤い文字?color=f00
```

## テスト

```powershell
mise exec -- node --test src/*.test.js
```
