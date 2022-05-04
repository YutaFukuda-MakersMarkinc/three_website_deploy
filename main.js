import './style.css'
import * as THREE from "three";

//canvasにTHREEを実装
const canvas = document.querySelector("#webgl");

//シーンの追加
const scene = new THREE.Scene();

//シーンに背景を追加
const textureLoader = new THREE.TextureLoader();
const bgTexture = textureLoader.load("./bg/bg.jpg");
scene.background = bgTexture;

//ブラウザのサイズを宣言
const sizes = {
    width: innerWidth,
    height: innerHeight
}

//カメラの追加
const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    1000
);

//レンダラーの追加
const renderer = new THREE.WebGL1Renderer({
    canvas: canvas,//レンダラーの描画する場所
});
renderer.setSize(sizes.width,sizes.height);//レンダラーの大きさ
renderer.setPixelRatio(window.devicePixelRatio);//粗さの軽減

//ジオメトリの作成（立方体）
const boxGeometry = new THREE.BoxGeometry(5, 5, 5, 10);
const boxMaterial = new THREE.MeshNormalMaterial();//光源不要のマテリアル
const box = new THREE.Mesh(boxGeometry, boxMaterial);
box.position.set(0, 0.5, -15);//ジオメトリの場所を以上※デフォルトではカメラ位置と重なり、ジオメトリが表示されないため
box.rotation.set(1, 1, 0);//ジオメトリを回転

//ジオメトリの作成（ドーナッツ型）
const torusGeometry = new THREE.TorusGeometry(8, 2, 16, 100);
const torusMaterial = new THREE.MeshNormalMaterial();//光源不要のマテリアル
const torus = new THREE.Mesh(torusGeometry, torusMaterial);
torus.position.set(0, 1, 10);//ジオメトリの場所を以上※デフォルトではカメラ位置と重なり、ジオメトリが表示されないため

scene.add(box, torus);

//線間補完を使用して滑らかに動かす※ラープ関数の公式
function lerp(x, y, a){
    return (1 - a) * x + a * y;
}
function scalePercent(start, end){
    return (scrollPercent - start) / (end - start);
}

//スクロールポジションに応じたアニメーションの実装
//1.animationScriptという空の配列を作成
const animationScripts = [];

//2-1.一つ目のアニメーション※boxのズームイン、トーラスのズームアウト
animationScripts.push({
    start: 0,//アニメーションが開始するスクロール位置
    end: 40,//アニメーションが終了するスクロール位置
    function(){
        camera.lookAt(box.position);//カメラは常に、box側をみる
        camera.position.set(0, 1, 10);
       //box.position.z += 0.01;//boxをz軸方向に、0.01プラスし続ける   
       box.position.z = lerp(-15, 2, scalePercent(0, 40));//ポジションを滑らかに動かすlerp関数を定義する※-15がスタート地点・2が終了地点・scalePercentが中間地点の割合※今回は0〜40の間で割合を計算
       torus.position.z = lerp(10, -20, scalePercent(0, 40));//ポジションを滑らかに動かすlerp関数を定義する※-15がスタート地点・2が終了地点・scalePercentが中間地点の割合※今回は0〜40の間で割合を計算
    }
});

//2-2.二つ目のアニメーション※boxの回転
animationScripts.push({
    start: 40,//アニメーションが開始するスクロール位置
    end: 60,//アニメーションが終了するスクロール位置
    function(){
        camera.lookAt(box.position);//カメラは常に、box側をみる
        camera.position.set(0, 1, 10);
       box.rotation.z = lerp(1, Math.PI, scalePercent(40, 60));
    }
});

//2-3.三つ目のアニメーション※カメラの移動
animationScripts.push({
    start: 60,//アニメーションが開始するスクロール位置
    end: 80,//アニメーションが終了するスクロール位置
    function(){
        camera.lookAt(box.position);//カメラは常に、box側をみる
        camera.position.x = lerp(0, -15, scalePercent(60, 80));
        camera.position.y = lerp(1, 15, scalePercent(60, 80));
        camera.position.z = lerp(10, 25, scalePercent(60, 80));
    }
});


//2-4.三つ目のアニメーション※カメラの移動
animationScripts.push({
    start: 80,//アニメーションが開始するスクロール位置
    end: 100,//アニメーションが終了するスクロール位置
    function(){
        camera.lookAt(box.position);//カメラは常に、box側をみる
        box.rotation.x += 0.02;
        box.rotation.y += 0.02;
    }
});

//3.関数の実行 -- アニメーションを開始
function playScrollAnimation() {
    animationScripts.forEach((animation) => {
        if(scrollPercent >= animation.start && scrollPercent <= animation.end){
            animation.function();
        }
    });
}

//4.ブラウザのスクロール率の取得
let scrollPercent = 0;//変数：scrollPercentに0を代入
document.body.onscroll = () => {
    scrollPercent = (document.documentElement.scrollTop / (document.documentElement.scrollHeight - document.documentElement.clientHeight)) * 100;//　現在のスクロール位置 / スクロール全体の高さ - ブラウザの高さ × 100
    //console.log(scrollPercent);
};

//windowのリサイズ調整
window.addEventListener("resize", () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer,setSize(
        sizes.width,
        sizes,height
    );
    renderer.setPixelRatio(window.devicePixelRatio);

})

//アニメーションの実装
const tick = () => {
    window.requestAnimationFrame(tick);//リクエストアニメーションフレームの度に、tickを呼び出し
    renderer.render(scene, camera);//リクエストアニメーションフレームの度に、シーンとカメラを更新
    playScrollAnimation();
};

tick();