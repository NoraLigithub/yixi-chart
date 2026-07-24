/* eslint-disable @next/next/no-img-element -- guide screenshots are fixed public assets */

import type { Metadata } from "next";
import { assetPath } from "../asset-path";
import styles from "./guide.module.css";

export const metadata: Metadata = {
  title: "一夕典藏｜30 秒上手",
  description:
    "一夕典藏简明使用说明：切换明暗与图谱版式，保存图片或复制完整信息。",
};

const steps = [
  {
    number: "01",
    title: "明暗切换",
    copy: "右上角点「明」或「暗」，页面与图谱会一起切换。",
  },
  {
    number: "02",
    title: "横幅 / 长卷",
    copy: "一花五叶谱可选横幅或长卷；横幅看全貌，长卷适合向下阅读。",
  },
  {
    number: "03",
    title: "保存图片",
    copy: "点「保存」取得当前版本；旁边的小箭头可选择其他明暗与版式。",
  },
  {
    number: "04",
    title: "复制信息",
    copy: "点「复制」即可取得当前图谱或典籍的完整文字信息。",
  },
] as const;

export default function GuidePage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href={assetPath("/")} aria-label="返回一夕典藏">
          <span className={styles.seal} aria-hidden="true">
            一夕
          </span>
          <span>
            <strong>一夕典藏</strong>
            <small>图谱与典籍</small>
          </span>
        </a>
        <a className={styles.back} href={assetPath("/")}>
          打开典藏
          <span aria-hidden="true">↗</span>
        </a>
      </header>

      <article className={styles.content}>
        <section className={styles.intro}>
          <p className={styles.eyebrow}>30 秒上手</p>
          <h1>点开即用，四处就够</h1>
          <p className={styles.lead}>
            选择想看的图谱或典籍，需要时切换外观与版式，最后保存图片或复制文字。
            把本页链接发给对方即可。
          </p>
        </section>

        <figure className={styles.overview}>
          <div className={styles.desktopShot}>
            <img
              src={assetPath("/guide/interface-desktop.jpg")}
              width="1280"
              height="720"
              alt="一夕典藏电脑界面，标出明暗、横幅长卷、保存与复制按钮"
            />
            <span className={`${styles.pin} ${styles.pinTheme}`}>
              <b>01</b> 明 / 暗
            </span>
            <span className={`${styles.pin} ${styles.pinLayout}`}>
              <b>02</b> 横幅 / 长卷
            </span>
            <span className={`${styles.pin} ${styles.pinSave}`}>
              <b>03</b> 保存
            </span>
            <span className={`${styles.pin} ${styles.pinCopy}`}>
              <b>04</b> 复制
            </span>
          </div>
          <figcaption>电脑界面：切换与操作按钮都在页面上方。</figcaption>
        </figure>

        <ol className={styles.steps}>
          {steps.map((step) => (
            <li key={step.number}>
              <span>{step.number}</span>
              <div>
                <h2>{step.title}</h2>
                <p>{step.copy}</p>
              </div>
            </li>
          ))}
        </ol>

        <section className={styles.mobileSection}>
          <div className={styles.mobileCopy}>
            <p className={styles.eyebrow}>手机与电脑自适应</p>
            <h2>同一个网址，换个屏幕也能直接用</h2>
            <p>
              手机打开后，按钮会自动排成紧凑的两行。横幅可以左右拖动查看，
              切成长卷后即可顺着页面向下阅读，无需另行设置。
            </p>
          </div>
          <figure className={styles.mobileShot}>
            <img
              src={assetPath("/guide/interface-mobile.jpg")}
              width="390"
              height="844"
              alt="手机上的一夕典藏长卷界面"
            />
            <figcaption>
              手机界面
              <span>长卷模式</span>
            </figcaption>
          </figure>
        </section>

        <footer className={styles.footer}>
          <p>明暗可选，版式可换，图片可存，文字可复制。</p>
          <a href={assetPath("/")}>现在打开一夕典藏</a>
        </footer>
      </article>
    </main>
  );
}
