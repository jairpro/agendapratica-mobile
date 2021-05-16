export function array_move(arr1: any[], old_index: number, new_index: number): any[] {
  let arr = JSON.parse(JSON.stringify(arr1))
  if (new_index >= arr.length) {
      var k = new_index - arr.length + 1;
      while (k--) {
          arr.push(undefined);
      }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
  return arr; // for testing
}
