//
//  ViewController.swift
//  iOS
//
//  Created by 藤木　博志 on 2018/02/20.
//  Copyright © 2018年 uniss. All rights reserved.
//

import UIKit

class ViewController: UIViewController {

    // 元の画面に戻る
    @IBAction func goBack(_ segue:UIStoryboardSegue) {}
    
    
    // カメラ画面に進む
    @IBAction func goNext(_ sender:UIButton) {
        let next = storyboard!.instantiateViewController(withIdentifier: "cameraview")
        self.present(next,animated: true, completion: nil)
    }
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

    
    
    
    
}

