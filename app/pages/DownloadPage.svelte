<script lang="ts">
  //const url = "https://gnose.top/"
  //const url = "https://jairpro.sistemanuvem.com/"
  //const url = "https://gnose.top/imagens/GnoseNaMadrugada.jpg"
  //const url = "https://drive.google.com/file/d/19qLvrbkP7BM7iAvLK00tG09Re0oi2j12/view?usp=sharing"
  //const url = "https://drive.google.com/drive/folders/1zhrn38wA4efF8-_80b0hS8CgTq_bfqUH?usp=sharing"
  $$props.url = "https://nota.dk"
</script>

<frame>
	<page
    xmlns="http://schemas.nativescript.org/tns.xsd"
    xmlns:nota="@nota/nativescript-webview-ext"
  >
    <stackLayout>
      <nota:WebViewExt src="{$$props.url}"></nota:WebViewExt>
    </stackLayout>
	</page>
</frame>
